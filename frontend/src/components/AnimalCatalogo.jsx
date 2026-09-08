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
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [promedio, setPromedio] = useState(null);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);
  const [errorComentarios, setErrorComentarios] = useState(null);
  const [autor, setAutor] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

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

  const cargarComentarios = (animalId) => {
    setCargandoComentarios(true);
    setErrorComentarios(null);

    return fetch(`${API_URL}/animals/${animalId}/comments`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar los comentarios');
        return res.json();
      })
      .then((data) => {
        setComentarios(data.comentarios);
        setPromedio(data.averageRating);
        setCargandoComentarios(false);
      })
      .catch((error) => {
        setErrorComentarios(error.message);
        setCargandoComentarios(false);
      });
  };

  const seleccionarAnimal = (animal) => {
    setAnimalSeleccionado(animal);
    setComentarios([]);
    setPromedio(null);
    setErrorFormulario(null);
    setMensajeExito(null);
    cargarComentarios(animal.id);
  };

  const enviarComentario = async (event) => {
    event.preventDefault();
    setEnviandoComentario(true);
    setErrorFormulario(null);
    setMensajeExito(null);

    try {
      const res = await fetch(
        `${API_URL}/animals/${animalSeleccionado.id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            autor,
            calificacion: Number(calificacion),
            comentario,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const detalle = data.detalles?.map((item) => item.mensaje).join(', ');
        throw new Error(detalle || data.error || 'No se pudo crear el comentario');
      }

      setAutor('');
      setCalificacion(5);
      setComentario('');
      setMensajeExito('Comentario creado correctamente');
      await cargarComentarios(animalSeleccionado.id);
    } catch (error) {
      setErrorFormulario(error.message);
    } finally {
      setEnviandoComentario(false);
    }
  };

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
            setAnimalSeleccionado(null);
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
            setAnimalSeleccionado(null);
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
              <button type="button" onClick={() => seleccionarAnimal(animal)}>
                <strong>{animal.nombre}</strong> — {animal.especie.nombre} —{' '}
                {animal.recinto.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}

      {animalSeleccionado && (
        <section>
          <h3>Detalle de {animalSeleccionado.nombre}</h3>
          <p>Especie: {animalSeleccionado.especie.nombre}</p>
          <p>Recinto: {animalSeleccionado.recinto.nombre}</p>
          <p>Edad: {animalSeleccionado.edad} año(s)</p>
          <p>
            Peso:{' '}
            {animalSeleccionado.peso
              ? `${animalSeleccionado.peso} kg`
              : 'Sin información'}
          </p>
          <p>
            Estado:{' '}
            {animalSeleccionado.disponible ? 'Disponible' : 'No disponible'}
          </p>

          <h3>Comentarios</h3>
          {promedio !== null && <p>Calificación promedio: {promedio.toFixed(1)}</p>}
          {cargandoComentarios && <p>Cargando comentarios...</p>}
          {errorComentarios && <p>{errorComentarios}</p>}

          {!cargandoComentarios && !errorComentarios && comentarios.length === 0 && (
            <p>Este animal todavía no tiene comentarios.</p>
          )}

          {!cargandoComentarios && !errorComentarios && comentarios.length > 0 && (
            <ul>
              {comentarios.map((item) => (
                <li key={item.id}>
                  <strong>{item.autor}</strong> ({item.calificacion}/5):{' '}
                  {item.comentario}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={enviarComentario}>
            <h3>Agregar comentario</h3>

            <label htmlFor="autor-comentario">Autor: </label>
            <input
              id="autor-comentario"
              value={autor}
              onChange={(event) => setAutor(event.target.value)}
              required
            />

            <label htmlFor="calificacion-comentario"> Calificación: </label>
            <select
              id="calificacion-comentario"
              value={calificacion}
              onChange={(event) => setCalificacion(event.target.value)}
            >
              {[1, 2, 3, 4, 5].map((valor) => (
                <option key={valor} value={valor}>
                  {valor}
                </option>
              ))}
            </select>

            <div>
              <label htmlFor="texto-comentario">Comentario: </label>
              <textarea
                id="texto-comentario"
                value={comentario}
                onChange={(event) => setComentario(event.target.value)}
                maxLength="500"
                required
              />
              <p>El comentario debe tener al menos 10 caracteres.</p>
            </div>

            {errorFormulario && <p>{errorFormulario}</p>}
            {mensajeExito && <p>{mensajeExito}</p>}

            <button type="submit" disabled={enviandoComentario}>
              {enviandoComentario ? 'Enviando...' : 'Publicar comentario'}
            </button>
          </form>
        </section>
      )}
    </section>
  );
}

export default AnimalCatalogo;
