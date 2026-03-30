export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Voz & Carreira
          </h1>
          <p className="text-xl text-indigo-200 mb-8">
            Portal de Dublagem e Fonoaudiologia
          </p>
          <p className="text-lg text-indigo-300 max-w-2xl mx-auto mb-12">
            Milhares de minicursos gratuitos de dublagem e fonoaudiologia. 
            O material de apoio definitivo para alunos e futuros profissionais do mercado.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto border border-white/20">
            <h2 className="text-2xl font-bold mb-4">🚀 Próximos Passos</h2>
            <ol className="text-left space-y-3 text-indigo-100">
              <li>1. Configure o Supabase (veja README.md)</li>
              <li>2. Execute o schema SQL no Supabase</li>
              <li>3. Configure as variáveis de ambiente (.env.local)</li>
              <li>4. Execute o script de migração de dados</li>
              <li>5. Inicie o servidor: npm run dev</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
