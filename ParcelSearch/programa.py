# Función para convertir el diccionario JS a un array de objetos
def convert_js_to_array(js_dict):
    # Eliminar "const countyStateMap = {" y "};"
    js_dict_clean = js_dict.replace("const countyStateMap = {", "").replace("};", "").strip()

    # Dividir el contenido en líneas
    lines = js_dict_clean.splitlines()

    # Inicializar una lista para almacenar el arreglo final
    counties_array = []

    # Iterar sobre cada línea y convertirla al nuevo formato
    for line in lines:
        if line.strip():  # Saltar líneas vacías
            county, state = line.replace('"', '').replace(',', '').split(":")
            counties_array.append(f'{{ county: {county.strip()}, state: "{state.strip()}" }}')

    return counties_array

# Leer el archivo JS
input_file = 'counties.js'
output_file = 'converted_counties.js'

with open(input_file, 'r') as file:
    js_content = file.read()

# Convertir el contenido del diccionario de JS a un arreglo
converted_array = convert_js_to_array(js_content)

# Preparar el contenido de salida
output_content = "const countyStateMap = [\n" + ",\n".join(converted_array) + "\n];"

# Escribir el arreglo convertido a un nuevo archivo JS
with open(output_file, 'w') as output:
    output.write(output_content)

print(f"¡Conversión completa! Archivo guardado como {output_file}")
