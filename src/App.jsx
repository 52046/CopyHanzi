// App.jsx
import React, { useState } from 'react';
import PizarraInicio from './components/PizarraInicio'; // El código que tenías antes
import Flashcards from './components/Flashcards';       // El código de las tarjetas
import './App.css';

function App() {
  // Este estado decide qué se dibuja en pantalla: 'inicio' o 'flashcards'
  const [pantallaActual, setPantallaActual] = useState('inicio');
  
  // Guardamos el nivel HSK que el usuario elija en la pizarra
  const [nivelElegido, setNivelElegido] = useState('1');
  const [modoElegido, setModoElegido] = useState('desafio');
  const [cantidadElegida, setCantidadElegida] = useState(15);
  const [bucleElegido, setBucleElegido] = useState(false);

  // Esta función la ejecutará el botón de tu Pizarra al hacer clic
  const navegarAFlashcards = (nivel, modo, cantidad, bucle) => {
  setNivelElegido(nivel);
  setModoElegido(modo);
  setCantidadElegida(cantidad);
  setBucleElegido(bucle);
  setPantallaActual('flashcards');
};
  return (
  <div className="app-container">
    {pantallaActual === 'inicio' ? (
      <PizarraInicio alSiguiente={navegarAFlashcards} />
    ) : (
      <div>
        <button 
          onClick={() => setPantallaActual('inicio')}
          style={{ padding: '10px 15px', marginBottom: '20px', background: '#EDE8D8', color: '#753434', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ⬅️ Volver al Inicio
        </button>
        
        <Flashcards 
          hskNivel={nivelElegido} 
          modoInicial={modoElegido} 
          mazoLimite={cantidadElegida} 
          bucleInicial={bucleElegido} // <-- Pasamos el bucle
          alTerminar={() => setPantallaActual('inicio')} // <-- Función para sacar al usuario cuando acabe
        />
      </div>
    )}
  </div>
);
}

export default App;