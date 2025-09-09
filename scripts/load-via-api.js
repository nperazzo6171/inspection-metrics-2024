import fs from 'fs';

async function loadDataViaAPI() {
  console.log('Carregando dados via API...');
  
  try {
    // Read the JSON file
    const jsonData = fs.readFileSync('../data/real-inspections.json', 'utf8');
    const inspections = JSON.parse(jsonData);
    
    console.log(`Total de registros encontrados: ${inspections.length}`);
    
    // Send data in batches via API
    const batchSize = 100;
    let totalLoaded = 0;
    
    for (let i = 0; i < inspections.length; i += batchSize) {
      const batch = inspections.slice(i, i + batchSize);
      
      try {
        const response = await fetch('http://localhost:5000/api/inspections/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inspections: batch })
        });
        
        if (response.ok) {
          totalLoaded += batch.length;
          console.log(`Carregados ${totalLoaded}/${inspections.length} registros`);
        } else {
          console.error(`Erro no batch ${i}: ${response.status}`);
        }
      } catch (error) {
        console.error(`Erro ao enviar batch ${i}:`, error.message);
      }
    }
    
    console.log(`\n✅ Carregamento concluído: ${totalLoaded} registros`);
    
  } catch (error) {
    console.error('❌ Erro durante o carregamento:', error.message);
    process.exit(1);
  }
}

loadDataViaAPI();