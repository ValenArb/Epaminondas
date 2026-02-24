import requests
import random
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def seed():
    print("Iniciando generación de datos de prueba...")
    
    # 1. Create Grados (Combos)
    grados_data = ["Pack 1er Año EP", "Pack 2do Año EP", "Pack 3er Año EP", "Combo 1er Año ES", "Combo 2do Año ES"]
    grados = []
    print("Creando catálogos por grado...")
    for g in grados_data:
        r = requests.post(f"{BASE_URL}/grados/", json={"nombre": g})
        if r.status_code == 200:
            grados.append(r.json())
            
    # Books pool
    book_titles = [
        "Matemática 1 Avanza - Kapelusz", "Ciencias Naturales 1 - Puerto de Palos", "Prácticas del Lenguaje 1 - Santillana",
        "Matemática 2 Avanza - Kapelusz", "Ciencias Sociales 2 - Estrada", "Prácticas del Lenguaje 2 - Santillana",
        "Físico Química 2 - Mandioca", "Historia 2 - Huellas", "Geografía 2 - Huellas",
        "Biología 3 - Santillana", "Geografía 3 - AZ", "Historia 3 - Kapelusz",
        "Inglés English in Mind 1", "Inglés English in Mind 2", "Diccionario Escolar", 
        "Constitución Nacional", "El Principito - Del Fondo", "Cuentos de la Selva - Losada"
    ]
    
    # 2. Add books to Grados
    print("Agregando libros a los catálogos...")
    for grado in grados:
        # Add 3 random books to each grado
        selected_books = random.sample(book_titles, 4)
        for b in selected_books:
            requests.post(f"{BASE_URL}/grados/{grado['id']}/libros/", json={
                "titulo": b,
                "editorial": b.split(" - ")[-1] if " - " in b else "Varias",
                "precio": random.choice([8500, 12000, 15000, 4500, 22000])
            })
            
    # 3. Add to Stock
    print("Ingresando stock de varios títulos...")
    stock_books = random.sample(book_titles, 8)
    for b in stock_books:
        requests.post(f"{BASE_URL}/stock/", json={
            "titulo": b,
            "tipo": "nuevo",
            "cantidad": random.randint(5, 15)
        })
        
    # 4. Create 10 Pedidos
    print("Generando 10 pedidos con 3 o 4 libros cada uno...")
    nombres = ["Lucía", "Martín", "Sofía", "Joaquín", "Florencia", "Valentín", "Micaela", "Tomás", "Carolina", "Emilio", "Agustina", "Ramiro", "Paula", "Facundo"]
    apellidos = ["García", "Fernández", "López", "Gómez", "Díaz", "Pérez", "Romero", "Sosa", "Torres", "Ruiz"]
    
    for i in range(10):
        cliente = f"{random.choice(nombres)} {random.choice(apellidos)}"
        num_libros = random.randint(3, 4)
        libros_pedido = []
        for b in random.sample(book_titles, num_libros):
            libros_pedido.append({"titulo": b, "precio": random.choice([8500, 12000, 15000, 4500, 22000]), "isbn": None})
            
        # Random dates
        dias_atras = random.randint(0, 5)
        fecha = (datetime.now() - timedelta(days=dias_atras)).strftime("%Y-%m-%d")
        fecha_tentativa = (datetime.now() + timedelta(days=random.randint(2, 10) - dias_atras)).strftime("%Y-%m-%d")
        
        requests.post(f"{BASE_URL}/pedidos/", json={
            "cliente": cliente,
            "telefono": f"11{random.randint(11111111, 99999999)}",
            "fecha": fecha,
            "fecha_tentativa": fecha_tentativa,
            "sena": random.choice([0, 5000, 10000, 15000]),
            "libros": libros_pedido
        })

if __name__ == "__main__":
    try:
        seed()
        print("✅ Generación de datos completada exitosamente.")
    except Exception as e:
        print(f"❌ Error durante la generación: {e}")
