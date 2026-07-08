import React from 'react';

function PizarraMinijuegos({ hskNivel, volver, abrirJuego }) {
  // Aquí puedes ir agregando todos los juegos que vayas creando
  const listaJuegos = [
    { 
      id: 'juego_une', 
      titulo: 'Une Pinyin', 
      icono: '🔗', 
      desc: 'Conecta el Hanzi con su pronunciación',
      disponible: true
    },
    { 
      id: 'juego_memoria', 
      titulo: 'Memorice', 
      icono: '🃏', 
      desc: 'Encuentra los pares iguales',
      disponible: false // Le ponemos false a los que están en construcción
    },
    { 
      id: 'juego_lluvia', 
      titulo: 'Lluvia Hanzi', 
      icono: '🌧️', 
      desc: 'Escribe antes de que caigan al piso',
      disponible: false
    }
  ];

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      
      {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button 
          onClick={volver}
          style={{ padding: '10px 15px', background: 'transparent', color: '#EDE8D8', border: '2px solid #EDE8D8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ⬅️ Volver
        </button>
        <h2 style={{ color: '#EDE8D8', margin: 0 }}>Arcade HSK {hskNivel} 🎮</h2>
        <div style={{ width: '80px' }}></div> {/* Espaciador invisible para centrar el título */}
      </div>

      {/* GRILLA ESTILO FRIV */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '20px' 
      }}>
        {listaJuegos.map((juego) => (
          <button
            key={juego.id}
            onClick={() => juego.disponible ? abrirJuego(juego.id) : alert('¡Próximamente!')}
            style={{
              backgroundColor: juego.disponible ? '#EDE8D8' : 'rgba(237, 232, 216, 0.1)',
              border: juego.disponible ? 'none' : '2px dashed #EDE8D8',
              borderRadius: '20px',
              padding: '25px 15px',
              cursor: juego.disponible ? 'pointer' : 'not-allowed',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.2s',
              boxShadow: juego.disponible ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'
            }}
            onMouseOver={(e) => { if(juego.disponible) e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { if(juego.disponible) e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={{ fontSize: '50px', marginBottom: '15px', opacity: juego.disponible ? 1 : 0.5 }}>
              {juego.icono}
            </span>
            <h3 style={{ margin: '0 0 10px 0', color: juego.disponible ? '#753434' : '#EDE8D8', fontSize: '18px' }}>
              {juego.titulo}
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: juego.disponible ? '#753434' : '#EDE8D8', opacity: 0.8 }}>
              {juego.desc}
            </p>
          </button>
        ))}
      </div>

    </div>
  );
}

export default PizarraMinijuegos;