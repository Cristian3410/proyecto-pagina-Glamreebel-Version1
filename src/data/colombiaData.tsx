// src/data/colombiaData.ts
export const colombiaLocations: Record<string, Record<string, string[]>> = {
  "Antioquia": {
    "Medellín": ["El Poblado", "Laureles", "Envigado", "Aranjuez", "Belén"],
    "Bello": ["Niquía", "Camacol", "La Gabriela"],
    "Itagüí": ["Aves María", "Santa María", "Viviendo"]
  },
  "Bogotá D.C.": {
    "Bogotá D.C.": ["Suba", "Usaquén", "Chicó", "Chapinero", "Teusaquillo", "Engativá", "Kennedy"]
  },
  "Valle del Cauca": {
    "Cali": ["San Fernando", "Granada", "El Peñón", "Ciudad Jardín", "San Antonio"],
    "Palmira": ["Centro", "Zamorano", "Bicentenario"]
  }
  // Puedes agregar más departamentos y ciudades según necesites
};