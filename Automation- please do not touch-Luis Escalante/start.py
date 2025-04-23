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

# CONFIGURACIONES DINÁMICAS
current_user = getpass.getuser()  # Obtiene el nombre de usuario actual
print(f"Usuario actual: {current_user}")

# Rutas dinámicas basadas en el usuario actual
profile_base = os.path.join(os.path.expanduser("~"), "AppData", "Local", "Google", "Chrome", "User Data")
profile_directory = "Profile 2"  # Esto puede requerir configuración específica por usuario
descargas_path = os.path.join(os.path.expanduser("~"), "Downloads")

# Rutas de trabajo - pueden adaptarse según necesidades
# Opción 1: ruta fija adaptada al usuario
base_onedrive = os.path.join(os.path.expanduser("~"), "OneDrive - deckardtech.com")
# Opción 2: solicitar la ruta si no existe la estructura estándar
if not os.path.exists(base_onedrive):
    print("No se encontró la ruta estándar de OneDrive.")
    base_onedrive = input("Por favor, ingrese la ruta completa a la carpeta OneDrive de Deckard: ")

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