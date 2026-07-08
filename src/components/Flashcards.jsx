import React, { useState, useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import hskData from '../data/hsk.json'; 

// NUEVO: Ahora también recibe "bucleInicial" y "alTerminar" (para regresar a la pizarra)
function Flashcards({ hskNivel = "1", modoInicial = "desafio", mazoLimite = 15, bucleInicial = false, alTerminar }) {
  
  const [mazoMezclado, setMazoMezclado] = useState([]);
  const [indice, setIndice] = useState(0);
  const [volteada, setVolteada] = useState(false);
  
  const [modo, setModo] = useState(modoInicial); 
  const [textoUsuario, setTextoUsuario] = useState('');
  const [feedback, setFeedback] = useState(''); 
  const [buenas, setBuenas] = useState(0);
  const [malas, setMalas] = useState(0);
  const [yaPenalizada, setYaPenalizada] = useState(false);

  const contenedorHanziRepaso = useRef(null);
  const inputRef = useRef(null); 

  // Mezclamos y acortamos el mazo al entrar
  useEffect(() => {
    const palabrasFiltradas = hskData.filter(p => p.cat === `hsk${hskNivel}`);
    
    const mazoCopia = [...palabrasFiltradas];
    for (let i = mazoCopia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mazoCopia[i], mazoCopia[j]] = [mazoCopia[j], mazoCopia[i]];
    }
    
    const mazoAcortado = mazoCopia.slice(0, Math.min(mazoLimite, mazoCopia.length));
    
    setMazoMezclado(mazoAcortado);
    setIndice(0);
    setVolteada(false);
    setBuenas(0);
    setMalas(0);
    setYaPenalizada(false);
    setFeedback('');
    setTextoUsuario('');
  }, [hskNivel, mazoLimite]);

  const palabraActual = mazoMezclado[indice] || { h: '', p: '', s: '' };

  // Autofocus
  useEffect(() => {
    if (modo === 'desafio' && inputRef.current && !volteada) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [indice, modo, volteada]); 

  // HanziWriter
  useEffect(() => {
    if (modo === 'repaso' && contenedorHanziRepaso.current && palabraActual.h && !volteada) {
      contenedorHanziRepaso.current.innerHTML = '';
      const caracteres = palabraActual.h.split('');

      caracteres.forEach(char => {
        const miniDiv = document.createElement('div');
        miniDiv.style.display = 'inline-block';
        miniDiv.style.margin = '0 5px';
        contenedorHanziRepaso.current.appendChild(miniDiv);

        HanziWriter.create(miniDiv, char, {
          width: caracteres.length > 2 ? 80 : 110,
          height: caracteres.length > 2 ? 80 : 110,
          padding: 5,
          strokeColor: '#b7aff0', 
          radicalColor: '#afe5f0',
          outlineColor: 'rgba(0, 0, 0, 0.2)',
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 300
        }).animateCharacter();
      });
    }
  }, [modo, mazoMezclado, indice, volteada, palabraActual]);

  // Manejar el volteo por pista
  const manejarVoltear = () => {
    if (!volteada) {
      setVolteada(true);
      if (modo === 'desafio' && feedback !== 'correcto') {
        if (!yaPenalizada) {
          setMalas(prev => prev + 1);
          setYaPenalizada(true); // Se activa el candado y marca que ya usó pista
        }
      }
      setTimeout(() => {
        setVolteada(false);
      }, 1500);
    } else {
      setVolteada(false);
    }
  };

  // CORREGIDO: Lógica inteligente para avanzar o terminar según el modo de bucle
  const saltarPalabra = () => {
    setVolteada(false);
    setTextoUsuario('');
    setFeedback('');
    setYaPenalizada(false);
    
    setTimeout(() => {
      if (indice < mazoMezclado.length - 1) {
        setIndice(prev => prev + 1);
      } else {
        // Llegamos al final del mazo limitado (ej: palabra 5 de 5)
        if (bucleInicial) {
          // MODO BUCLE: Reinicia al primer elemento de este mismo mazo
          setIndice(0);
        } else {
          // MODO NORMAL: Alerta de éxito y saca al usuario a la Pizarra de inicio
          alert(`🎉 ¡Felicidades! Completaste tu sesión de ${mazoMezclado.length} palabras.`);
          if (alTerminar) alTerminar(); 
        }
      }
    }, 300); 
  };

  // CORREGIDO: Al escribir bien tras usar pista, avanza pero NO suma a las buenas
  const verificarInput = (e) => {
    const valor = e.target.value;
    setTextoUsuario(valor);

    if (valor.trim() === palabraActual.h) {
      setFeedback('correcto');
      
      // ERROR 3 SOLUCIONADO: Solo suma a las Buenas si NO usó la pista previa
      if (!yaPenalizada) {
        setBuenas(prev => prev + 1);
      }

      setVolteada(true); 

      setTimeout(() => {
        saltarPalabra();
      }, 2000);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      
      {/* Indicador de progreso */}
      <p style={{ color: '#EDE8D8', fontSize: '14px', opacity: 0.7, marginBottom: '25px' }}>
        Palabra {indice + 1} de {mazoMezclado.length} {bucleInicial && "🔄"}
      </p>

      {/* ERROR 1 SOLUCIONADO: Eliminamos el bloque de botones selector de modo de aquí arriba */}

      {/* MARCADOR */}
      {modo === 'desafio' && (
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px', color: '#EDE8D8', fontWeight: 'bold' }}>
          <span style={{ backgroundColor: 'rgba(237, 232, 216, 0.15)', padding: '5px 12px', borderRadius: '20px' }}>✅ Buenas: {buenas}</span>
          <span style={{ backgroundColor: 'rgba(237, 232, 216, 0.15)', padding: '5px 12px', borderRadius: '20px' }}>❌ Malas: {malas}</span>
        </div>
      )}

      {/* COMPONENTE INTERACTIVO CON ANIMACIÓN 3D */}
      <div className="flashcard-contenedor-3d" onClick={feedback === 'correcto' ? null : manejarVoltear}>
        <div className={`flashcard-interna ${volteada ? 'girada' : ''}`} style={{
          border: feedback === 'correcto' ? '4px solid #84cc16' : 'none',
          borderRadius: '20px'
        }}>
          
          {/* CARA DEL FRENTE */}
          <div className="cara-frente">
            {modo === 'desafio' ? (
              <h1 style={{ fontSize: '90px', color: '#EDE8D8', margin: 0 }}>{palabraActual.h}</h1>
            ) : (
              <div ref={contenedorHanziRepaso} style={{ display: 'flex', justifyContent: 'center' }} />
            )}
            <p style={{ color: '#EDE8D8', opacity: 0.7, fontSize: '11px', marginTop: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {modo === 'desafio' ? "Escribe abajo o toca para ver pista" : "Piensa el significado y toca para voltear"}
            </p>
          </div>

          {/* CARA DE ATRÁS */}
          <div className="cara-atras">
            <span style={{ color: '#EDE8D8', opacity: 0.6, fontSize: '12px', textTransform: 'uppercase' }}>Pronunciación</span>
            <h1 style={{ fontSize: '55px', color: '#EDE8D8', margin: '5px 0 10px 0', fontWeight: 'bold' }}>
              {palabraActual.p}
            </h1>
            <span style={{ color: '#EDE8D8', opacity: 0.6, fontSize: '12px', textTransform: 'uppercase' }}>Significado</span>
            <h3 style={{ fontSize: '24px', color: '#EDE8D8', margin: '5px 0 0 0', fontWeight: 'normal' }}>
              {palabraActual.s}
            </h3>
          </div>

        </div>
      </div>

      {/* ELEMENTOS DEBAJO DE LA TARJETA */}
      <div style={{ marginTop: '25px' }}>
        {modo === 'desafio' ? (
          <div>
            <input 
              ref={inputRef} 
              type="text"
              placeholder={feedback === 'correcto' ? "¡Muy bien!" : "Escribe el Hanzi aquí..."}
              value={textoUsuario}
              onChange={verificarInput}
              disabled={feedback === 'correcto'}
              style={{
                width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #EDE8D8',
                backgroundColor: 'transparent', color: '#FFFFFF', fontSize: '20px', textAlign: 'center',
                outline: 'none', marginBottom: '15px'
              }}
            />
            <button 
              onClick={saltarPalabra}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                border: feedback === 'correcto' ? 'none' : '2px solid #EDE8D8', 
                backgroundColor: feedback === 'correcto' ? '#EDE8D8' : 'transparent', 
                color: feedback === 'correcto' ? '#753434' : '#EDE8D8', 
                fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              {feedback === 'correcto' ? 'Cargando siguiente... ⏳' : 'Saltar palabra ➡️'}
            </button>
          </div>
        ) : (
          <button 
            onClick={saltarPalabra}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              border: '2px solid #EDE8D8', backgroundColor: 'transparent', color: '#EDE8D8', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            Saltar palabra ➡️
          </button>
        )}
      </div>

    </div>
  );
}

export default Flashcards;