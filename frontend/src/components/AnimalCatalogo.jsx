import { useEffect, useState } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  const [animales, setAnimales] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [especieId, setEspecieId] = useState('');
  const [recintoId, setRecintoId] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/especies`).then((res) => res.json()),
      fetch(`${API_URL}/recintos`).then((res) => res.json()),
    ])
      .then(([dataEspecies, dataRecintos]) => {
        setEspecies(dataEspecies);
        setRecintos(dataRecintos);
      })
      .catch(() => {
        setError('No se pudieron cargar las opciones de los filtros');
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (especieId) params.append('especieId', especieId);
    if (recintoId) params.append('recintoId', recintoId);

    fetch(`${API_URL}/animals?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setAnimales(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los animales');
        setCargando(false);
      });
  }, [especieId, recintoId]);

  return (
    <section>
      <h2>Catálogo de animales</h2>

      <div>
        <label htmlFor="filtro-especie">Especie: </label>
        <select
          id="filtro-especie"
          value={especieId}
          onChange={(event) => {
            setCargando(true);
            setError(null);
            setEspecieId(event.target.value);
          }}
        >
          <option value="">Todas</option>
          {especies.map((especie) => (
            <option key={especie.id} value={especie.id}>
              {especie.nombre}
            </option>
          ))}
        </select>

        <label htmlFor="filtro-recinto"> Recinto: </label>
        <select
          id="filtro-recinto"
          value={recintoId}
          onChange={(event) => {
            setCargando(true);
            setError(null);
            setRecintoId(event.target.value);
          }}
        >
          <option value="">Todos</option>
          {recintos.map((recinto) => (
            <option key={recinto.id} value={recinto.id}>
              {recinto.nombre}
            </option>
          ))}
        </select>
      </div>

      {cargando && <p>Cargando animales...</p>}
      {error && <p>{error}</p>}

      {!cargando && !error && (
        <ul>
          {animales.map((animal) => (
            <li key={animal.id}>
              <strong>{animal.nombre}</strong> — {animal.especie.nombre} —{' '}
              {animal.recinto.nombre}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AnimalCatalogo;
