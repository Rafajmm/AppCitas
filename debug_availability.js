const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'appcitas',
  password: 'postgres',
  port: 5432,
});

async function debugAvailability() {
  const negocioId = '10be4b97-6218-411a-9d7f-0f9b0c26aade'; // Talleres Basti
  const date = '2026-03-17';
  const dayOfWeek = new Date(date).getDay();
  
  console.log('=== DEBUG AVAILABILITY ===');
  console.log('Negocio ID:', negocioId);
  console.log('Date:', date);
  console.log('Day of week:', dayOfWeek);
  
  try {
    // 1. Check if negocio exists
    const { rows: negocio } = await pool.query(
      'SELECT * FROM negocios WHERE id = $1 AND deleted_at IS NULL',
      [negocioId]
    );
    console.log('\n1. Negocio:', negocio.length > 0 ? 'EXISTS' : 'NOT FOUND');
    if (negocio.length > 0) {
      console.log('   - Nombre:', negocio[0].nombre);
      console.log('   - Activo:', negocio[0].activo);
      console.log('   - Reservas habilitadas:', negocio[0].reservas_habilitadas);
    }
    
    // 2. Check business schedules
    const { rows: businessSchedules } = await pool.query(
      `SELECT hora_apertura, hora_cierre
       FROM horarios_negocio
       WHERE negocio_id = $1 AND dia_semana = $2 AND activo = true
       LIMIT 1`,
      [negocioId, dayOfWeek]
    );
    console.log('\n2. Business Schedules:', businessSchedules.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (businessSchedules.length > 0) {
      console.log('   - Apertura:', businessSchedules[0].hora_apertura);
      console.log('   - Cierre:', businessSchedules[0].hora_cierre);
    }
    
    // 3. Check all business schedules
    const { rows: allSchedules } = await pool.query(
      'SELECT * FROM horarios_negocio WHERE negocio_id = $1',
      [negocioId]
    );
    console.log('\n3. All Business Schedules:', allSchedules.length);
    allSchedules.forEach(s => {
      console.log(`   - Día ${s.dia_semana}: ${s.hora_apertura} - ${s.hora_cierre} (activo: ${s.activo})`);
    });
    
    // 4. Check services
    const { rows: services } = await pool.query(
      `SELECT * FROM servicios 
       WHERE negocio_id = $1 AND deleted_at IS NULL AND activo = true`,
      [negocioId]
    );
    console.log('\n4. Services:', services.length);
    services.forEach(s => {
      console.log(`   - ${s.nombre}: ${s.duracion_minutos} min (${s.id})`);
    });
    
    // 5. Check employees
    const { rows: employees } = await pool.query(
      `SELECT * FROM empleados 
       WHERE negocio_id = $1 AND deleted_at IS NULL AND activo = true`,
      [negocioId]
    );
    console.log('\n5. Employees:', employees.length);
    employees.forEach(e => {
      console.log(`   - ${e.nombre} (${e.id})`);
    });
    
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await pool.end();
  }
}

debugAvailability();
