import React, { useState, useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import hskData from '../data/hsk.json'; 
import Star from '../assets/icon/Stars.svg';
import Game from '../assets/icon/Game.svg';

function PizarraInicio({ alSiguiente , alMinijuegos }) {
  const [hskSeleccionado, setHskSeleccionado] = useState('1');
  
  // --- ESTADOS PARA EL MODAL FLOTANTE ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoConfig, setModoConfig] = useState('desafio'); // 'desafio' o 'repaso'
  const [cantidadConfig, setCantidadConfig] = useState(15);  // 5, 15, 30, 50

  const contenedorHanzi = useRef(null);
  const [bucleConfig, setBucleConfig] = useState(false); // false = Normal, true = Bucle infinito

  // LÓGICA PARA EL HANZI DEL DÍA
  const hoy = new Date().toISOString().split('T')[0];
  const sumaFecha = hoy.split('-').reduce((acc, num) => acc + parseInt(num), 0);
  const indiceDelDia = sumaFecha % hskData.length;
  const hanziDelDia = hskData[indiceDelDia] || hskData[0];
  

  useEffect(() => {
    if (contenedorHanzi.current && hanziDelDia?.h) {
      contenedorHanzi.current.innerHTML = '';
      const caracteres = hanziDelDia.h.split('');

      caracteres.forEach(char => {
        const miniDiv = document.createElement('div');
        miniDiv.style.display = 'inline-block';
        miniDiv.style.margin = '0 8px';
        contenedorHanzi.current.appendChild(miniDiv);

        const tamaño = caracteres.length > 2 ? 90 : 130;

        HanziWriter.create(miniDiv, char, {
          width: tamaño, height: tamaño, padding: 5,
          strokeColor: '#753434', radicalColor: '#753434',
          outlineColor: 'rgba(117, 52, 52, 0.15)',
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 250     
        }).animateCharacter();
      });
    }
  }, [hanziDelDia]);

  const relanzarAnimacion = () => {
    if (contenedorHanzi.current && hanziDelDia?.h) {
      contenedorHanzi.current.innerHTML = '';
      const caracteres = hanziDelDia.h.split('');
      caracteres.forEach(char => {
        const miniDiv = document.createElement('div');
        miniDiv.style.display = 'inline-block';
        miniDiv.style.margin = '0 8px';
        contenedorHanzi.current.appendChild(miniDiv);
        const tamaño = caracteres.length > 2 ? 90 : 130;
        
        HanziWriter.create(miniDiv, char, {
          width: tamaño, height: tamaño, padding: 5,
          strokeColor: '#753434', radicalColor: '#753434',
          outlineColor: 'rgba(117, 52, 52, 0.15)',
          strokeAnimationSpeed: 1.2 
        }).animateCharacter();
      });
    }
  };

  // Al confirmar el modal, mandamos toda la config junta hacia App.jsx
  const iniciarMazo = () => {
  setMostrarModal(false);
  alSiguiente(hskSeleccionado, modoConfig, cantidadConfig, bucleConfig); // <-- Pasamos bucleConfig
};

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* TARJETA DEL HANZI DEL DÍA */}
      <div style={{ borderRadius: '20px', padding: '35px', marginBottom: '40px', backgroundColor: '#ede8d8', boxShadow: '0 15px 35px -10px rgba(0,0,0,0.15)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', backgroundColor: '#6B6751' }}></div>
        <span style={{ color: '#6B6751', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Palabra del Día ({hanziDelDia.level || hanziDelDia.cat || '?'})
        </span>
        
        <div ref={contenedorHanzi} onClick={relanzarAnimacion} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '25px auto', cursor: 'pointer', width: 'max-content', minHeight: '140px' }} title="¡Haz clic para ver cómo se escribe!" />
        <h2 style={{ color: '#28374A', margin: '5px 0', fontWeight: 'bold', letterSpacing: '0.5px' }}>{hanziDelDia.p}</h2>
        <p style={{ fontSize: '20px', color: '#28374A', margin: '15px 0 0 0', color: '#753434', fontWeight: '600' }}>
          {hanziDelDia.s} 
        </p>
      </div>

      <hr style={{ border: '0', height: '1px', background: '#6B6751', opacity: 0.2, marginBottom: '35px' }} />
      <h3 style={{ marginBottom: '20px', color: '#ede8d8', fontWeight: '600' }}>¿Qué nivel te apetece practicar hoy?</h3>
      
      {/* Selector de Nivel */}
      <div style={{ marginBottom: '35px' }}>
        <select value={hskSeleccionado} onChange={(e) => setHskSeleccionado(e.target.value)} style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '16px', border: 'none', backgroundColor: '#ede8d8', color: '#753434', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <option value="1">Nivel HSK 1</option>
          <option value="2">Nivel HSK 2</option>
          <option value="3">Nivel HSK 3</option>
          <option value="4">Nivel HSK 4</option>
          <option value="5">Nivel HSK 5</option>
          <option value="6">Nivel HSK 6</option>
        </select>
      </div>
      
      {/* Botones de Modos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
        <button 
          onClick={() => setMostrarModal(true)} // <-- AHORA ABRE EL MODAL EN VEZ DE SALTAR DIRECTO
          style={{ padding: '25px', borderRadius: '15px', border: '2px solid #ede8d8', background: 'transparent', cursor: 'pointer' }}
        >
          <img src={Star} alt="Flashcards" style={{ width: '35px', height: '35px' }} />
          <h4 style={{ margin: '12px 0 5px 0', fontSize: '18px', color: '#ede8d8', fontWeight: '700' }}>Modo Flashcards</h4>
        </button>

        <button 
          onClick={() => alMinijuegos(hskSeleccionado)} // <-- Reemplaza el alert por esto
          style={{ padding: '25px', borderRadius: '15px', border: '2px solid #ede8d8', background: 'transparent', cursor: 'pointer' }}
        >
          <img src={Game} alt="Minijuegos" style={{ width: '35px', height: '35px' }} />
          <h4 style={{ margin: '12px 0 5px 0', fontSize: '18px', color: '#ede8d8', fontWeight: '700' }}>Minijuegos</h4>
          <p style={{ fontSize: '12px', color: '#ede8d8', margin: 0 }}>Une Pinyin con Hanzi</p>
        </button>
      </div>

      {/* ==========================================
          VENTANA FLOTANTE (MODAL CONFIGURACIÓN)
          ========================================== */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#753434', border: '2px solid #EDE8D8', borderRadius: '20px', padding: '30px', width: '100%', maxWidth: '450px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            
            <h3 style={{ color: '#EDE8D8', margin: '0 0 25px 0' }}>Configurar Flashcards HSK {hskSeleccionado}</h3>

            {/* FILA 1: MODOS DE JUEGO */}
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{ color: '#EDE8D8', fontSize: '14px', opacity: 0.8, display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>1. MODO FLASHCARD:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setModoConfig('desafio')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #EDE8D8', fontWeight: 'bold', cursor: 'pointer', backgroundColor: modoConfig === 'desafio' ? '#EDE8D8' : 'transparent', color: modoConfig === 'desafio' ? '#753434' : '#EDE8D8' }}>Desafío</button>
                <button onClick={() => setModoConfig('repaso')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #EDE8D8', fontWeight: 'bold', cursor: 'pointer', backgroundColor: modoConfig === 'repaso' ? '#EDE8D8' : 'transparent', color: modoConfig === 'repaso' ? '#753434' : '#EDE8D8' }}>Repaso</button>
              </div>
            </div>

            {/* FILA 2: CANTIDAD DE TARJETAS */}
            <div style={{ marginBottom: '35px', textAlign: 'left' }}>
              <label style={{ color: '#EDE8D8', fontSize: '14px', opacity: 0.8, display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>2. TAMAÑO DEL MAZO:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                {[5, 15, 30, 50].map((num) => (
                  <button key={num} onClick={() => setCantidadConfig(num)} style={{ padding: '10px', borderRadius: '8px', border: '2px solid #EDE8D8', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cantidadConfig === num ? '#EDE8D8' : 'transparent', color: cantidadConfig === num ? '#753434' : '#EDE8D8' }}>{num}</button>
                ))}
              </div>
            </div>

            {/* FILA 3: MODO NORMAL VS BUCLE INFINITO */}
            <div style={{ marginBottom: '35px', textAlign: 'left' }}>
              <label style={{ color: '#EDE8D8', fontSize: '14px', opacity: 0.8, display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>3. TIPO DE SESIÓN:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setBucleConfig(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #EDE8D8', fontWeight: 'bold', cursor: 'pointer', backgroundColor: !bucleConfig ? '#EDE8D8' : 'transparent', color: !bucleConfig ? '#753434' : '#EDE8D8' }}>Modo Normal</button>
                <button onClick={() => setBucleConfig(true)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #EDE8D8', fontWeight: 'bold', cursor: 'pointer', backgroundColor: bucleConfig ? '#EDE8D8' : 'transparent', color: bucleConfig ? '#753434' : '#EDE8D8' }}>Modo Bucle</button>
              </div>
            </div>

            {/* ACCIONES DEL MODAL */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setMostrarModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #EDE8D8', backgroundColor: 'transparent', color: '#EDE8D8', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={iniciarMazo} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#EDE8D8', color: '#753434', fontWeight: 'bold', cursor: 'pointer' }}>Comenzar</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default PizarraInicio;