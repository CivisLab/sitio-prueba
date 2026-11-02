// Perfiles para la ficha del aspirante. Escrito a mano para el prototipo.
// Los aspirantes A a F son PERSONAS INVENTADAS: su trayectoria, sus cargos, sus enlaces y la sanción
// de D son de ejemplo, para mostrar el formato. Ningún dato es de un aspirante real de 2027.
// La única persona real es Carlos Calle Galvis, con su candidatura de 2019 (la de datos/ficha.js, ya
// en sitio-prueba); su perfil (cargos y enlaces) va con datos de ejemplo porque su autorización es un
// borrador. La regla de qué entra es la del concepto de Jurídica sobre perfiles (§1.2, §1.3, §4.2).
window.PERFILES = {
  revisado: "2026-11-02",
  // Las fuentes de sanciones que se consultan para todos, con la misma fecha (mismo formato para todos, §4.3).
  consultadas: [
    "Procuraduría General de la Nación · SIRI (antecedentes disciplinarios)",
    "Contraloría General de la República · boletín de responsables fiscales",
    "Rama Judicial · consulta de procesos con sentencia ejecutoriada",
  ],
  personas: {
    "Aspirante A": {
      inventada: true,
      aspira: "Alcaldía de Medellín · 2027",
      candidaturas: [
        { anio: 2023, corp: "Alcaldía", lugar: "Medellín", votos: 61330, elegido: false, fuente: "Registraduría, escrutinio" },
        { anio: 2019, corp: "Concejo", lugar: "Medellín", votos: 14902, elegido: true, fuente: "Registraduría, escrutinio" },
        { anio: 2015, corp: "Concejo", lugar: "Medellín", votos: 11240, elegido: true, fuente: "CEDAE" },
      ],
      cargos: [
        { cargo: "Concejal de Medellín", desde: 2020, hasta: 2023, fuente: "Concejo de Medellín, acta de posesión" },
        { cargo: "Concejal de Medellín", desde: 2016, hasta: 2019, fuente: "Concejo de Medellín, acta de posesión" },
      ],
      sanciones: [],
      enlaces: { wikipedia: true },
    },
    "Aspirante B": {
      inventada: true,
      aspira: "Alcaldía de Medellín · 2027",
      candidaturas: [
        { anio: 2019, corp: "Asamblea", lugar: "Antioquia", votos: 38115, elegido: true, fuente: "Registraduría, escrutinio" },
      ],
      cargos: [
        { cargo: "Diputado de Antioquia", desde: 2020, hasta: 2023, fuente: "Asamblea de Antioquia, gaceta" },
      ],
      sanciones: [],
      enlaces: { wikipedia: false },
    },
    "Aspirante C": {
      inventada: true,
      aspira: "Alcaldía de Medellín · 2027",
      candidaturas: [],
      cargos: [
        { cargo: "Gerente de una empresa pública del municipio", desde: 2020, hasta: 2023, fuente: "SIGEP, hoja de vida" },
        { cargo: "Subsecretario de despacho", desde: 2016, hasta: 2019, fuente: "Decreto de nombramiento" },
      ],
      sanciones: [],
      enlaces: { wikipedia: false },
    },
    "Aspirante D": {
      inventada: true,
      aspira: "Alcaldía de Medellín · 2027",
      candidaturas: [
        { anio: 2015, corp: "Alcaldía", lugar: "Municipio X (inventado)", votos: 24508, elegido: true, fuente: "CEDAE" },
        { anio: 2011, corp: "Concejo", lugar: "Municipio X (inventado)", votos: 2210, elegido: true, fuente: "CEDAE" },
      ],
      cargos: [
        { cargo: "Alcalde del Municipio X (inventado)", desde: 2016, hasta: 2019, fuente: "Acta de posesión" },
      ],
      // Ejemplo de FORMATO: una persona inventada, una decisión inventada. Hecho, fecha y fuente; sin adjetivos.
      sanciones: [
        { tipo: "Disciplinaria", decision: "Suspensión en el ejercicio del cargo por tres meses", autoridad: "Procuraduría Regional de Antioquia", firme: "2021-05-14", fuente: "SIRI de la Procuraduría", ejemplo: true },
      ],
      enlaces: { wikipedia: true },
    },
    "Aspirante E": {
      inventada: true,
      aspira: "Alcaldía de Medellín · 2027",
      candidaturas: [
        { anio: 2023, corp: "Concejo", lugar: "Medellín", votos: 6874, elegido: false, fuente: "Registraduría, escrutinio" },
      ],
      cargos: [],
      sanciones: [],
      enlaces: { wikipedia: false },
    },
    "Aspirante F": {
      inventada: true,
      aspira: "Alcaldía de Medellín · 2027",
      candidaturas: [
        { anio: 2023, corp: "Concejo", lugar: "Medellín", votos: 9032, elegido: true, fuente: "Registraduría, escrutinio" },
        { anio: 2019, corp: "JAL", lugar: "Comuna 16, Belén", votos: 1480, elegido: true, fuente: "Registraduría, escrutinio" },
      ],
      cargos: [
        { cargo: "Concejal de Medellín", desde: 2024, hasta: null, fuente: "Concejo de Medellín, acta de posesión" },
        { cargo: "Edil de la JAL de Belén", desde: 2020, hasta: 2023, fuente: "Resolución de la Registraduría" },
      ],
      sanciones: [],
      enlaces: { wikipedia: false },
    },
    "Carlos Calle Galvis": {
      inventada: false,
      ejemploPerfil: true,     // cargos y enlaces de ejemplo: su autorización es un borrador
      vinculo: "Carlos Calle Galvis es el fundador de CivisLab.",
      aspira: null,
      // La candidatura sí es real: escrutinio mesa a mesa y CEDAE, confirmada por el IPET (30-oct).
      candidaturas: [
        { anio: 2019, corp: "Concejo", lugar: "Medellín", votos: 1916, elegido: null, fuente: "Escrutinio mesa a mesa (Registraduría) y MMV 2019", real: true },
      ],
      cargos: [
        { cargo: "Cargo público de ejemplo", desde: 2020, hasta: 2021, fuente: "Dato de ejemplo", ejemplo: true },
      ],
      sanciones: [],
      enlaces: { wikipedia: false, ejemplo: true },
    },
  },
};
