import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-blue-600">E-commerce</h1>
                  <nav className="flex gap-6">
                    <a href="/" className="text-gray-700 hover:text-blue-600 transition">Home</a>
                    <a href="/catalog" className="text-gray-700 hover:text-blue-600 transition">Catálogo</a>
                    <a href="/cart" className="text-gray-700 hover:text-blue-600 transition">Carrinho</a>
                    <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Login</a>
                  </nav>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <section className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Bem-vindo ao E-commerce Premium</h2>
                <p className="text-xl text-gray-600 mb-8">Estrutura completa pronta para desenvolvimento</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105">
                  Começar a Explorar
                </button>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-48 flex items-center justify-center">
                      <span className="text-white text-4xl">Produto {item}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Produto Premium #{item}</h3>
                      <p className="text-gray-600 mb-4">Descrição do produto aqui</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600">R$ {(99.99 * item).toFixed(2)}</span>
                        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition">
                          Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </main>

            <footer className="bg-gray-900 text-white mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4">Sobre</h3>
                    <p className="text-gray-400">E-commerce moderno com FastAPI e React</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Produtos</h3>
                    <ul className="text-gray-400 space-y-2">
                      <li><a href="#" className="hover:text-white transition">Eletrônicos</a></li>
                      <li><a href="#" className="hover:text-white transition">Roupas</a></li>
                      <li><a href="#" className="hover:text-white transition">Livros</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Suporte</h3>
                    <ul className="text-gray-400 space-y-2">
                      <li><a href="#" className="hover:text-white transition">Contato</a></li>
                      <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                      <li><a href="#" className="hover:text-white transition">Devoluções</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Legal</h3>
                    <ul className="text-gray-400 space-y-2">
                      <li><a href="#" className="hover:text-white transition">Termos</a></li>
                      <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                      <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                  <p>&copy; 2024 E-commerce. Todos os direitos reservados.</p>
                </div>
              </div>
            </footer>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
