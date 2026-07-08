import React, { useState, useEffect } from 'react';
import hskData from '../data/hsk.json';

function JuegoUneHanzi({ hskNivel, volver }) {
  // ==========================================
  // ESTADOS DEL JUEGO
  // ==========================================
  // NUEVO: Agrupamos todo el tablero en un solo estado para evitar errores de sincronización
  const [mesa, setMesa] = useState({
    pozo: [],
    hanzi: [],
    pinyin: []
  });
  
  const [seleccionHanzi, setSeleccionHanzi] = useState(null);
  const [seleccionPinyin, setSeleccionPinyin] = useState(null);
  const [estadoMatch, setEstadoMatch] = useState(null);
  const [idsSaliendo, setIdsSaliendo] = useState([]);

  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);

  const TAMANO_MESA = 5;

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  useEffect(() => {
    const palabrasNivel = hskData.filter(p => p.cat === `hsk${hskNivel}`);
    const mazoMezclado = [...palabrasNivel]
      .map((p, index) => ({ ...p, id: `pal_${index}` }))
      .sort(() => Math.random() - 0.5);

    const mesaInicial = mazoMezclado.slice(0, TAMANO_MESA);
    const pozoInicial = mazoMezclado.slice(TAMANO_MESA);

    // Cargamos todo de golpe
    setMesa({
      hanzi: [...mesaInicial].sort(() => Math.random() - 0.5),
      pinyin: [...mesaInicial].sort(() => Math.random() - 0.5),
      pozo: pozoInicial
    });
  }, [hskNivel]);

  // ==========================================
  // LÓGICA DE MATCH Y ANIMACIONES
  // ==========================================
  useEffect(() => {
    if (seleccionHanzi && seleccionPinyin) {
      if (seleccionHanzi.id === seleccionPinyin.id) {
        // ¡MATCH CORRECTO!
        const idMatch = seleccionHanzi.id;
        setAciertos(prev => prev + 1);

        // 1. Marcamos este par en la lista de salida INMEDIATAMENTE
        setIdsSaliendo(prev => [...prev, idMatch]);

        // 2. ¡LIBERAMOS TUS DEDOS AL INSTANTE! 
        // Al vaciar las selecciones YA puedes hacer clic en cualquier otro par del tablero
        setSeleccionHanzi(null);
        setSeleccionPinyin(null);

        // 3. El recambio y la limpieza del pozo ocurren en segundo plano a los 400ms
        setTimeout(() => {
          setMesa(prevMesa => {
            let nuevaH = [...prevMesa.hanzi];
            let nuevaP = [...prevMesa.pinyin];
            let nuevoPozo = [...prevMesa.pozo];

            const idxH = nuevaH.findIndex(x => x?.id === idMatch);
            const idxP = nuevaP.findIndex(x => x?.id === idMatch);
            if (idxH !== -1) nuevaH[idxH] = null;
            if (idxP !== -1) nuevaP[idxP] = null;

            const huecos = nuevaH.filter(x => x === null).length;

            // Rellenamos por lotes (solo si se acumulan 2 o más huecos vacíos)
            if (huecos >= 2 || (huecos > 0 && nuevoPozo.length > 0 && nuevoPozo.length <= huecos)) {
              const aExtraer = Math.min(huecos, nuevoPozo.length);
              const cartasNuevas = nuevoPozo.slice(0, aExtraer);
              nuevoPozo = nuevoPozo.slice(aExtraer);

              const mixH = [...cartasNuevas].sort(() => Math.random() - 0.5);
              const mixP = [...cartasNuevas].sort(() => Math.random() - 0.5);

              let contH = 0;
              for(let i = 0; i < nuevaH.length; i++) {
                if (nuevaH[i] === null && contH < aExtraer) { nuevaH[i] = mixH[contH]; contH++; }
              }
              let contP = 0;
              for(let i = 0; i < nuevaP.length; i++) {
                if (nuevaP[i] === null && contP < aExtraer) { nuevaP[i] = mixP[contP]; contP++; }
              }
            }

            return { hanzi: nuevaH, pinyin: nuevaP, pozo: nuevoPozo };
          });

          // Quitamos el ID de la lista de animación
          setIdsSaliendo(prev => prev.filter(id => id !== idMatch));
        }, 400); // 400ms calza perfecto con la animación CSS popOut

      } else {
        // ERROR: Aquí sí congelamos brevemente para que veas el rojo, 
        // pero lo bajamos a solo 350ms para que no sea molesto.
        setEstadoMatch('error');
        setErrores(prev => prev + 1);

        setTimeout(() => {
          setSeleccionHanzi(null);
          setSeleccionPinyin(null);
          setEstadoMatch(null);
        }, 350); 
      }
    }
  }, [seleccionHanzi, seleccionPinyin]);

  // ==========================================
  // ACTUALIZACIÓN DE COLORES DINÁMICOS
  // ==========================================
  const obtenerColorBoton = (item, seleccionActual) => {
    if (!item) return 'transparent';
    // Si la carta está en proceso de desaparecer (match correcto), se pinta verde al instante
    if (idsSaliendo.includes(item.id)) return '#84cc16'; 
    
    if (seleccionActual?.id === item.id) {
      if (estadoMatch === 'error') return '#ef4444';    
      return '#b7aff0'; // Lavanda esperando pareja
    }
    return 'transparent';
  };

  const juegoTerminado = mesa.hanzi.every(item => item === null) && mesa.pozo.length === 0;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      
      {/* ANIMACIONES CSS */}
      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0.3); opacity: 0; }
            80% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes popOut {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
          .carta-entra { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          .carta-sale { animation: popOut 0.3s forwards; pointer-events: none; }
          .hueco-vacio { opacity: 0 !important; pointer-events: none; border: 2px dashed rgba(237, 232, 216, 0.2) !important; }
        `}
      </style>

      {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={volver} style={{ padding: '10px 15px', background: 'transparent', color: '#EDE8D8', border: '2px solid #EDE8D8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          ⬅️ Abandonar
        </button>
        <span style={{ color: '#EDE8D8', fontWeight: 'bold', backgroundColor: 'rgba(237,232,216,0.1)', padding: '8px 15px', borderRadius: '20px' }}>
          En Pozo: {mesa.pozo.length}
        </span>
      </div>

      {juegoTerminado ? (
        <div style={{ padding: '50px', backgroundColor: '#EDE8D8', borderRadius: '20px', marginTop: '50px' }}>
          <h1 style={{ color: '#753434' }}>¡Nivel Completado! 🎉</h1>
          <p style={{ color: '#753434', fontSize: '18px', fontWeight: 'bold' }}>Aciertos: {aciertos} | Errores: {errores}</p>
          <button onClick={volver} style={{ marginTop: '20px', padding: '15px 30px', backgroundColor: '#753434', color: '#EDE8D8', border: 'none', borderRadius: '10px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>
            Volver al Arcade
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* COLUMNA IZQUIERDA: HANZI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#EDE8D8', margin: '0 0 10px 0', opacity: 0.7 }}>Hanzi</h3>
            {mesa.hanzi.map((item, index) => {
              const estaSaliendo = item && idsSaliendo.includes(item.id);
              const esVacio = !item;
              return (
                <button
                  key={item ? `h_${item.id}` : `h_vacio_${index}`}
                  disabled={esVacio || idsSaliendo.includes(item.id) || estadoMatch === 'error'}
                  onClick={() => setSeleccionHanzi(item)}
                  className={esVacio ? 'hueco-vacio' : (estaSaliendo ? 'carta-sale' : 'carta-entra')}
                  style={{
                    height: '80px', fontSize: '35px', fontWeight: 'bold',
                    backgroundColor: obtenerColorBoton(item, seleccionHanzi),
                    color: item && idsSaliendo.includes(item.id) ? '#ffffff' : (seleccionHanzi?.id === item?.id ? '#28374A' : '#EDE8D8'),
                    border: '2px solid #EDE8D8', borderRadius: '12px',
                    cursor: esVacio ? 'default' : 'pointer',
                    transition: 'background-color 0.2s, color 0.2s'
                  }}
                >
                  {item?.h}
                </button>
              );
            })}
          </div>

          {/* COLUMNA DERECHA: PINYIN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#EDE8D8', margin: '0 0 10px 0', opacity: 0.7 }}>Pinyin</h3>
            {mesa.pinyin.map((item, index) => {
              const estaSaliendo = item && idsSaliendo.includes(item.id);
              const esVacio = !item;
              return (
                <button
                  key={item ? `p_${item.id}` : `p_vacio_${index}`}
                  disabled={esVacio || idsSaliendo.includes(item.id) || estadoMatch === 'error'}
                  onClick={() => setSeleccionPinyin(item)}
                  className={esVacio ? 'hueco-vacio' : (estaSaliendo ? 'carta-sale' : 'carta-entra')}
                  style={{
                    height: '80px', fontSize: '22px',
                    backgroundColor: obtenerColorBoton(item, seleccionPinyin),
                    color: item && idsSaliendo.includes(item.id) ? '#ffffff': (seleccionPinyin?.id === item?.id ? '#28374A' : '#EDE8D8'),
                    border: '2px solid #EDE8D8', borderRadius: '12px',
                    cursor: esVacio ? 'default' : 'pointer',
                    transition: 'background-color 0.2s, color 0.2s'
                  }}
                >
                  {item?.p}
                </button>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}

export default JuegoUneHanzi;