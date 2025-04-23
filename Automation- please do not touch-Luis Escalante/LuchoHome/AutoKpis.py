import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
import time
import os
import glob
import datetime
import pandas as pd
import subprocess
import getpass
import json
import socket

def obtener_ruta_config():
    """Obtiene la ruta absoluta del archivo de configuración en el mismo directorio del ejecutable"""
    if getattr(sys, 'frozen', False):
        directorio_ejecutable = os.path.dirname(sys.executable)
    else:
        directorio_ejecutable = os.path.dirname(os.path.abspath(__file__))
    
    return os.path.join(directorio_ejecutable, "Autokpis_config.json")

def listar_perfiles_chrome():
    """Obtiene la lista de perfiles disponibles en Chrome"""
    try:
        profile_base = os.path.join(os.path.expanduser("~"), "AppData", "Local", "Google", "Chrome", "User Data")
        local_state_path = os.path.join(profile_base, "Local State")
        
        if not os.path.exists(local_state_path):
            print(f"No se encontró el archivo Local State en {local_state_path}")
            return ["Default"]
        
        with open(local_state_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        profile_info = data.get('profile', {}).get('info_cache', {})
        perfiles = list(profile_info.keys())
        
        if "Default" not in perfiles:
            perfiles.insert(0, "Default")
            
        return perfiles
    
    except Exception as e:
        print(f"Error al obtener perfiles: {e}")
        return ["Default"]

def cargar_configuracion():
    """Carga la configuración desde el archivo o crea una nueva"""
    config_path = obtener_ruta_config()
    
    if os.path.exists(config_path):
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            print("Configuración cargada correctamente.")
            return config
        except Exception as e:
            print(f"Error al cargar la configuración: {e}")
            return {"usuarios": {}}
    else:
        print("Archivo de configuración no encontrado. Se creará uno nuevo.")
        return {"usuarios": {}}

def guardar_configuracion(config):
    """Guarda la configuración en un archivo JSON"""
    config_path = obtener_ruta_config()
    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=4)
        print("Configuración guardada correctamente.")
        return True
    except Exception as e:
        print(f"Error al guardar la configuración: {e}")
        return False

def seleccionar_perfil(config):
    """Usa el perfil guardado o permite al usuario seleccionar uno nuevo"""
    usuario_actual = getpass.getuser()
    hostname = socket.gethostname()
    id_maquina = f"{usuario_actual}@{hostname}"
    
    if id_maquina in config["usuarios"]:
        perfil_guardado = config["usuarios"][id_maquina].get("perfil_chrome")
        if perfil_guardado:
            print(f"Usando perfil guardado: '{perfil_guardado}'")
            return perfil_guardado, config
    
    perfiles = listar_perfiles_chrome()
    
    print("\n=== Perfiles de Chrome disponibles ===")
    for i, perfil in enumerate(perfiles, 1):
        print(f"{i}. {perfil}")
    
    while True:
        try:
            seleccion = input("\nSeleccione el número del perfil a usar (o presione Enter para usar Default): ")
            
            if not seleccion.strip():
                perfil_seleccionado = "Default"
            else:
                indice = int(seleccion) - 1
                if 0 <= indice < len(perfiles):
                    perfil_seleccionado = perfiles[indice]
                else:
                    print("Número fuera de rango. Intente nuevamente.")
                    continue
            
            if id_maquina not in config["usuarios"]:
                config["usuarios"][id_maquina] = {}
            
            config["usuarios"][id_maquina]["perfil_chrome"] = perfil_seleccionado
            config["usuarios"][id_maquina]["ultima_ejecucion"] = datetime.datetime.now().isoformat()
            
            guardar_configuracion(config)
            return perfil_seleccionado, config
            
        except ValueError:
            print("Por favor, ingrese un número válido.")

def limpiar_descargas():
    """Elimina archivos Excel antiguos de cyborg de la carpeta Descargas"""
    descargas_path = os.path.join(os.path.expanduser("~"), "Downloads")
    archivos_cyborg = glob.glob(os.path.join(descargas_path, "cyborg_job_stats*.xls*"))
    
    if not archivos_cyborg:
        print("No se encontraron archivos cyborg_job_stats para limpiar.")
        return
    
    for archivo in archivos_cyborg:
        try:
            os.remove(archivo)
            print(f"Archivo eliminado: {os.path.basename(archivo)}")
        except Exception as e:
            print(f"Error al eliminar {archivo}: {e}")

def configurar_rutas_trabajo(config):
    """Configura las rutas de trabajo"""
    usuario_actual = getpass.getuser()
    hostname = socket.gethostname()
    id_maquina = f"{usuario_actual}@{hostname}"
    
    if id_maquina in config["usuarios"] and "rutas" in config["usuarios"][id_maquina]:
        rutas = config["usuarios"][id_maquina]["rutas"]
        
        if all(os.path.exists(rutas[k]) for k in ["base_onedrive", "destino", "ruta_kpi_col"]):
            print("Usando rutas guardadas")
            return rutas["base_onedrive"], rutas["destino"], rutas["ruta_kpi_col"], config
    
    base_onedrive = os.path.join(os.path.expanduser("~"), "OneDrive - deckardtech.com")
    
    if not os.path.exists(base_onedrive):
        print("No se encontró la ruta estándar de OneDrive.")
        base_onedrive = input("Por favor, ingrese la ruta completa a la carpeta OneDrive de Deckard: ")
        while not os.path.exists(base_onedrive):
            print("La ruta ingresada no existe.")
            base_onedrive = input("Por favor, ingrese una ruta válida (o deje vacío para salir): ")
            if not base_onedrive.strip():
                print("Proceso cancelado por el usuario.")
                exit()
    
    destino = os.path.join(base_onedrive, "Deckard Tech - Colombia", "Key Performance Indicator", "Source")
    ruta_kpi_col = os.path.join(base_onedrive, "Deckard Tech - Colombia", "Key Performance Indicator", "kpi-col")
    
    for directory in [destino, ruta_kpi_col]:
        if not os.path.exists(directory):
            try:
                os.makedirs(directory)
                print(f"Directorio creado: {directory}")
            except Exception as e:
                print(f"Error al crear directorio {directory}: {e}")
    
    if id_maquina not in config["usuarios"]:
        config["usuarios"][id_maquina] = {}
    
    config["usuarios"][id_maquina]["rutas"] = {
        "base_onedrive": base_onedrive,
        "destino": destino,
        "ruta_kpi_col": ruta_kpi_col
    }
    
    guardar_configuracion(config)
    
    return base_onedrive, destino, ruta_kpi_col, config

def descargar_archivo_cyborg(options, descargas_path, max_reintentos=3):
    """Intenta descargar el archivo de Cyborg con reintentos"""
    reintento = 0
    archivo_reciente = None
    
    while reintento < max_reintentos and archivo_reciente is None:
        reintento += 1
        print(f"\nIntento {reintento} de {max_reintentos}")
        
        try:
            # Cerrar Chrome si está abierto
            try:
                subprocess.run(["taskkill", "/F", "/IM", "chrome.exe"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                time.sleep(2)
            except subprocess.CalledProcessError:
                pass
            
            driver = webdriver.Chrome(options=options)
            
            print("Accediendo a Cyborg...")
            driver.get("https://cyborg.deckard.com/job_stats")
            time.sleep(5)
            
            print("Localizando botón de exportación...")
            button = driver.find_element(By.ID, "btn_export_job_stats")
            ActionChains(driver).move_to_element(button).click().perform()
            print("Descarga iniciada...")
            
            # Esperar con timeout para la descarga
            timeout = 120  # aumentamos el timeout a 120 segundos
            tiempo_inicio = time.time()
            archivo_encontrado = False
            
            print("Esperando a que el archivo aparezca en descargas...")
            while (time.time() - tiempo_inicio) < timeout and not archivo_encontrado:
                # Buscar archivos que coincidan con el patrón
                lista_archivos = glob.glob(os.path.join(descargas_path, "cyborg_job_stats*.xls*"))
                
                # Filtrar archivos que no estén en uso (tamaño estable)
                for archivo in lista_archivos:
                    try:
                        # Verificar que el archivo no se esté escribiendo
                        size_before = os.path.getsize(archivo)
                        time.sleep(2)
                        size_after = os.path.getsize(archivo)
                        
                        if size_before == size_after and size_before > 0:
                            archivo_reciente = archivo
                            archivo_encontrado = True
                            print(f"Archivo descargado correctamente: {archivo_reciente}")
                            break
                    except Exception as e:
                        print(f"Error verificando archivo {archivo}: {e}")
                        continue
                
                if not archivo_encontrado:
                    time.sleep(5)  # Esperar 5 segundos antes de volver a verificar
            
            if not archivo_encontrado:
                print("Tiempo de espera agotado. No se encontró el archivo descargado.")
            
        except Exception as e:
            print(f"Error durante el intento {reintento}: {str(e)}")
        finally:
            if 'driver' in locals():
                # Esperar un poco más antes de cerrar para asegurar
                time.sleep(2)
                driver.quit()
        
        if not archivo_encontrado and reintento < max_reintentos:
            print(f"Esperando 5 segundos antes del próximo intento...")
            time.sleep(5)
    
    return archivo_reciente

def procesar_archivo(archivo_reciente, destino):
    """Procesa el archivo descargado y lo guarda en la ubicación correcta"""
    if not archivo_reciente:
        print("No se pudo descargar el archivo después de varios intentos.")
        return False
    
    try:
        fecha_ayer = datetime.date.today() - datetime.timedelta(days=1)
        fecha_ayer_str = fecha_ayer.strftime("%Y-%m-%d")
        nuevo_nombre = f"{fecha_ayer_str}.xlsx"
        ruta_destino = os.path.join(destino, nuevo_nombre)
        
        print(f"Procesando archivo: {archivo_reciente}")
        df = pd.read_excel(archivo_reciente)
        df['date'] = pd.to_datetime(df['date']).dt.date
        df = df.sort_values(by='date', ascending=False)
        df_filtrado = df[df['date'] == fecha_ayer]
        
        if not df_filtrado.empty:
            os.makedirs(os.path.dirname(ruta_destino), exist_ok=True)
            df_filtrado.to_excel(ruta_destino, index=False)
            print(f"Archivo filtrado y guardado como: {ruta_destino}")
            return True
        else:
            print(f"No hay datos para la fecha {fecha_ayer_str}, no se creó archivo.")
            return False
            
    except Exception as e:
        print(f"Error al procesar el archivo: {str(e)}")
        return False

def ejecutar_main_kpi(ruta_kpi_col):
    """Ejecuta el script main.py en el entorno pipenv"""
    try:
        print("\nEjecutando main.py dentro del entorno pipenv...")
        resultado = subprocess.run(
            ["pipenv", "run", "python", "main2.py"],
            cwd=ruta_kpi_col,
            check=True,
            capture_output=True,
            text=True
        )
        print("main.py ejecutado correctamente.")
        print("Salida:", resultado.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error al ejecutar main.py: {str(e)}")
        print("Error output:", e.stderr)
        return False

def main():
    print("=== Iniciando Autokpis ===")
    
    # PASO 1: CARGAR CONFIGURACIÓN
    print("\nCargando configuración...")
    config = cargar_configuracion()
    
    # PASO 2: CONFIGURAR USUARIO Y PERFIL
    current_user = getpass.getuser()
    print(f"Usuario actual: {current_user}")
    
    # PASO 3: SELECCIONAR PERFIL
    profile_base = os.path.join(os.path.expanduser("~"), "AppData", "Local", "Google", "Chrome", "User Data")
    profile_directory, config = seleccionar_perfil(config)
    print(f"Usando perfil de Chrome: {profile_directory}")
    
    # PASO 4: CONFIGURAR RUTAS
    descargas_path = os.path.join(os.path.expanduser("~"), "Downloads")
    base_onedrive, destino, ruta_kpi_col, config = configurar_rutas_trabajo(config)
    
    print("\nRutas configuradas:")
    print(f"- Descargas: {descargas_path}")
    print(f"- Base OneDrive: {base_onedrive}")
    print(f"- Destino: {destino}")
    print(f"- KPI-COL: {ruta_kpi_col}")
    
    # CONFIGURAR OPCIONES DE CHROME
    options = webdriver.ChromeOptions()
    options.add_argument(f"user-data-dir={profile_base}")
    options.add_argument(f"profile-directory={profile_directory}")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    
    # LIMPIAR DESCARGAS PREVIAS
    print("\nLimpiando descargas anteriores...")
    limpiar_descargas()
    
    # INTENTAR DESCARGAR EL ARCHIVO
    archivo_reciente = descargar_archivo_cyborg(options, descargas_path, max_reintentos=3)
    
    # PROCESAR ARCHIVO DESCARGADO
    archivo_procesado = procesar_archivo(archivo_reciente, destino)
    
    # EJECUTAR MAIN.PY SI SE PROCESÓ CORRECTAMENTE
    if archivo_procesado:
        ejecutado = ejecutar_main_kpi(ruta_kpi_col)
        
        # ACTUALIZAR TIMESTAMP DE ÚLTIMA EJECUCIÓN EXITOSA
        if ejecutado:
            id_maquina = f"{current_user}@{socket.gethostname()}"
            if id_maquina in config["usuarios"]:
                config["usuarios"][id_maquina]["ultima_ejecucion_exitosa"] = datetime.datetime.now().isoformat()
                guardar_configuracion(config)
    
    # LIMPIAR ARCHIVOS TEMPORALES
    print("\nLimpiando archivos temporales...")
    limpiar_descargas()
    
    print("\n=== Proceso completado ===")

if __name__ == "__main__":
    main()