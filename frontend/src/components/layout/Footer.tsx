import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">E-Shop</h3>
            <p className="text-gray-400 text-sm">
              A melhor plataforma de e-commerce para compras online com segurança e facilidade.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Início</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition">Catálogo</Link></li>
              <li><Link to="/about" className="hover:text-white transition">Sobre</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contato</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/privacy" className="hover:text-white transition">Privacidade</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Termos</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition">Cookies</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@eshop.com</li>
              <li>Telefone: (11) 9999-9999</li>
              <li>Endereço: São Paulo, SP</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 E-Shop. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
