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

def listar_perfiles_chrome():
    """Obtiene la lista de perfiles disponibles en Chrome"""
    try:
        # Ruta base del perfil de Chrome
        profile_base = os.path.join(os.path.expanduser("~"), "AppData", "Local", "Google", "Chrome", "User Data")
        
        # Verificar si existe el archivo Local State que contiene info de los perfiles
        local_state_path = os.path.join(profile_base, "Local State")
        
        if not os.path.exists(local_state_path):
            print(f"No se encontró el archivo Local State en {local_state_path}")
            return ["Default"]
        
        # Leer el archivo JSON de estado local
        with open(local_state_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extraer info de perfiles
        profile_info = data.get('profile', {}).get('info_cache', {})
        perfiles = list(profile_info.keys())
        
        # Siempre incluir "Default" si no está ya
        if "Default" not in perfiles:
            perfiles.insert(0, "Default")
            
        return perfiles
    
    except Exception as e:
        print(f"Error al obtener perfiles: {e}")
        return ["Default"]

def cargar_configuracion():
    """Carga la configuración desde el archivo o crea una nueva"""
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "startkpi_config.json")
    
    # Si el archivo existe, lo cargamos
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
        # Si no existe, creamos una estructura básica
        print("Archivo de configuración no encontrado. Se creará uno nuevo.")
        return {"usuarios": {}}

def guardar_configuracion(config):
    """Guarda la configuración en un archivo JSON"""
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "startkpi_config.json")
    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=4)
        print("Configuración guardada correctamente.")
        return True
    except Exception as e:
        print(f"Error al guardar la configuración: {e}")
        return False

def seleccionar_perfil(config):
    """Usa el perfil guardado o permite al usuario seleccionar uno nuevo si no existe configuración"""
    # Identificadores únicos
    usuario_actual = getpass.getuser()
    hostname = socket.gethostname()
    id_maquina = f"{usuario_actual}@{hostname}"
    
    # Verificar si ya existe configuración para este usuario y máquina
    if id_maquina in config["usuarios"]:
        perfil_guardado = config["usuarios"][id_maquina].get("perfil_chrome")
        if perfil_guardado:
            print(f"Usando perfil guardado: '{perfil_guardado}'")
            return perfil_guardado, config
    
    # Si no hay configuración, mostrar opciones para seleccionar
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
            
            # Guardar selección en la configuración
            if id_maquina not in config["usuarios"]:
                config["usuarios"][id_maquina] = {}
            
            config["usuarios"][id_maquina]["perfil_chrome"] = perfil_seleccionado
            config["usuarios"][id_maquina]["ultima_ejecucion"] = datetime.datetime.now().isoformat()
            
            guardar_configuracion(config)
            return perfil_seleccionado, config
            
        except ValueError:
            print("Por favor, ingrese un número válido.")

def configurar_rutas_trabajo(config):
    """Configura las rutas de trabajo, usando las guardadas o pidiendo nuevas si es necesario"""
    usuario_actual = getpass.getuser()
    hostname = socket.gethostname()
    id_maquina = f"{usuario_actual}@{hostname}"
    
    # Verificar si ya existe configuración de rutas para este usuario
    if id_maquina in config["usuarios"] and "rutas" in config["usuarios"][id_maquina]:
        rutas = config["usuarios"][id_maquina]["rutas"]
        
        # Verificar que las rutas existan
        if all(os.path.exists(rutas[k]) for k in ["base_onedrive", "destino", "ruta_kpi_col"]):
            print("Usando rutas guardadas")
            return rutas["base_onedrive"], rutas["destino"], rutas["ruta_kpi_col"], config
    
    # Si no hay configuración o las rutas no existen, pedir nuevas rutas
    # Primero intentamos la ruta estándar
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
    
    # Construir rutas derivadas
    destino = os.path.join(base_onedrive, "Deckard Tech - Colombia", "Key Performance Indicator", "Source")
    ruta_kpi_col = os.path.join(base_onedrive, "Deckard Tech - Colombia", "Key Performance Indicator", "kpi-col")
    
    # Verificar y crear directorios si no existen
    for directory in [destino, ruta_kpi_col]:
        if not os.path.exists(directory):
            try:
                os.makedirs(directory)
                print(f"Directorio creado: {directory}")
            except Exception as e:
                print(f"Error al crear directorio {directory}: {e}")
    
    # Guardar rutas en configuración
    if id_maquina not in config["usuarios"]:
        config["usuarios"][id_maquina] = {}
    
    config["usuarios"][id_maquina]["rutas"] = {
        "base_onedrive": base_onedrive,
        "destino": destino,
        "ruta_kpi_col": ruta_kpi_col
    }
    
    guardar_configuracion(config)
    
    return base_onedrive, destino, ruta_kpi_col, config


# PASO 1: CARGAR/CREAR CONFIGURACIÓN
print("Inicializando configuración...")
config = cargar_configuracion()

# PASO 2: CONFIGURAR USUARIO Y PERFIL
current_user = getpass.getuser()  # Obtiene el nombre de usuario actual
print(f"Usuario actual: {current_user}")

# PASO 3: SELECCIONAR PERFIL (AUTOMÁTICAMENTE O NUEVO SI NO EXISTE)
profile_base = os.path.join(os.path.expanduser("~"), "AppData", "Local", "Google", "Chrome", "User Data")
profile_directory, config = seleccionar_perfil(config)
print(f"Usando perfil de Chrome: {profile_directory}")

# PASO 4: CONFIGURAR RUTAS
descargas_path = os.path.join(os.path.expanduser("~"), "Downloads")
base_onedrive, destino, ruta_kpi_col, config = configurar_rutas_trabajo(config)

print(f"Usando las siguientes rutas:")
print(f"- Base OneDrive: {base_onedrive}")
print(f"- Destino: {destino}")
print(f"- KPI-COL: {ruta_kpi_col}")

# CONFIGURA CHROME
options = webdriver.ChromeOptions()
options.add_argument(f"user-data-dir={profile_base}")
options.add_argument(f"profile-directory={profile_directory}")
#options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--window-size=1920,1080")

# CIERRA TODAS LAS INSTANCIAS DE CHROME PARA EVITAR ERRORES CON EL PERFIL
try:
    print("Cerrando instancias de Chrome...")
    subprocess.run(["taskkill", "/F", "/IM", "chrome.exe"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(3)  # Espera unos segundos a que cierre completamente
except subprocess.CalledProcessError:
    print("No se pudieron cerrar las instancias de Chrome o no había ninguna activa.")

# INICIA SELENIUM
try:
    driver = webdriver.Chrome(options=options)
    
    # ABRE LA PÁGINA Y DESCARGA
    driver.get("https://cyborg.deckard.com/job_stats")
    time.sleep(5)
    button = driver.find_element(By.ID, "btn_export_job_stats")
    ActionChains(driver).move_to_element(button).click().perform()
    time.sleep(5)  # Espera a que se descargue el archivo

finally:
    if 'driver' in locals():
        driver.quit()

# BUSCA EL ARCHIVO MÁS RECIENTE DESCARGADO
lista_archivos = glob.glob(os.path.join(descargas_path, "cyborg_job_stats.*.xls"))
archivo_reciente = max(lista_archivos, key=os.path.getctime) if lista_archivos else None

archivo_guardado_exitosamente = False

if archivo_reciente:
    print(f"Archivo encontrado: {archivo_reciente}")

    # CALCULA FECHA DE AYER PARA FILTRO Y NOMBRE
    fecha_ayer = datetime.date.today() - datetime.timedelta(days=1)
    fecha_ayer_str = fecha_ayer.strftime("%Y-%m-%d")
    nuevo_nombre = f"{fecha_ayer_str}.xlsx"
    ruta_destino = os.path.join(destino, nuevo_nombre)

    try:
        # LEE Y PROCESA EL ARCHIVO
        df = pd.read_excel(archivo_reciente)

        # ASEGURA FORMATO DE FECHA EN LA COLUMNA 'date'
        df['date'] = pd.to_datetime(df['date']).dt.date

        # ORDENA DE MÁS RECIENTE A MÁS ANTIGUA
        df = df.sort_values(by='date', ascending=False)

        # FILTRA SOLO LA FECHA DE AYER
        df_filtrado = df[df['date'] == fecha_ayer]

        # SI HAY DATOS, LOS GUARDA
        if not df_filtrado.empty:
            # Asegúrate de que el directorio destino existe
            os.makedirs(os.path.dirname(ruta_destino), exist_ok=True)
            df_filtrado.to_excel(ruta_destino, index=False)
            print(f"Archivo filtrado y guardado como: {ruta_destino}")
            archivo_guardado_exitosamente = True
        else:
            print(f"No hay datos para la fecha {fecha_ayer_str}, no se creó archivo.")

    except Exception as e:
        print(f"Error al procesar el archivo: {e}")
else:
    print("No se encontró ningún archivo .xls con el prefijo 'cyborg_job_stats'")

# EJECUTA EL SCRIPT SOLO SI HUBO ARCHIVO GUARDADO
if archivo_guardado_exitosamente:
    try:
        print("Ejecutando main.py dentro del entorno pipenv...")
        subprocess.run(
            ["pipenv", "run", "python", "main.py"],
            cwd=ruta_kpi_col,
            check=True
        )
        print("main.py ejecutado correctamente.")
    except subprocess.CalledProcessError as e:
        print(f"Error al ejecutar main.py: {e}")

# ACTUALIZAR TIMESTAMP DE ÚLTIMA EJECUCIÓN EXITOSA
if archivo_guardado_exitosamente:
    id_maquina = f"{current_user}@{socket.gethostname()}"
    if id_maquina in config["usuarios"]:
        config["usuarios"][id_maquina]["ultima_ejecucion_exitosa"] = datetime.datetime.now().isoformat()
        guardar_configuracion(config)