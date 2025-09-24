const admin = require('firebase-admin');
const fs = require('fs');

try {
    const serviceAccount = require('./serviceAccountKey.json');
    // ATENÇÃO: Mudamos o nome do arquivo para carregar os dados formatados
    const dadosAlunos = JSON.parse(fs.readFileSync('alunos.json', 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();

    async function importarDados() {
      console.log('Iniciando a importação com o formato exato do exemplo...');

      // O nome da coleção será "students", como na imagem
      const colecao = db.collection('students');
      const batch = db.batch();

      dadosAlunos.forEach(aluno => {
        // --- MUDANÇA PRINCIPAL AQUI ---
        // Ao chamar .doc() sem um ID, o Firestore gera um automaticamente
        const docRef = colecao.doc(); 
        batch.set(docRef, aluno);
      });

      // Envia todos os dados de uma vez
      await batch.commit();

      console.log(`✅ SUCESSO! ${dadosAlunos.length} alunos foram importados para a coleção "students".`);
    }

    importarDados().catch(error => console.error("Ocorreu um erro:", error));

} catch (error) {
    console.error('❌ ERRO: Verifique se os arquivos "serviceAccountKey.json" e "alunos-formatado.json" estão na pasta correta.');
}