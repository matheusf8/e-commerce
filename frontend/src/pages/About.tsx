import { Shield, Zap, HeadphonesIcon, Truck, Star, TrendingUp, Users, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

const stats = [
  { value: '50K+', label: 'Clientes Satisfeitos', icon: Users },
  { value: '10K+', label: 'Produtos Vendidos', icon: TrendingUp },
  { value: '98%', label: 'Avaliações Positivas', icon: Star },
  { value: '5+', label: 'Anos de Mercado', icon: Award },
]

const values = [
  {
    title: 'Qualidade',
    description: 'Selecionamos os melhores produtos do mercado para garantir sua satisfação.',
    icon: Shield,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Inovação',
    description: 'Estamos sempre atualizados com as últimas tendências e tecnologias.',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    title: 'Suporte Premium',
    description: 'Atendimento personalizado 24/7 para resolver todas as suas dúvidas.',
    icon: HeadphonesIcon,
    color: 'bg-green-100 text-green-600',
  },
  {
    title: 'Entrega Rápida',
    description: 'Logística eficiente para você receber seus produtos no menor tempo.',
    icon: Truck,
    color: 'bg-purple-100 text-purple-600',
  },
]

const team = [
  {
    name: 'Ana Silva',
    role: 'CEO & Fundadora',
    bio: 'Empreendedora visionária com 15 anos de experiência no mercado digital.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
  },
  {
    name: 'Carlos Mendes',
    role: 'CTO',
    bio: 'Engenheiro de software especializado em e-commerce e arquiteturas escaláveis.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  },
  {
    name: 'Juliana Costa',
    role: 'Head de Marketing',
    bio: 'Estrategista digital focada em crescimento e experiência do cliente.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
  },
]

const testimonials = [
  {
    text: 'Melhor loja online que já comprei! O produto chegou antes do prazo e em perfeito estado.',
    author: 'Maria Oliveira',
    rating: 5,
    role: 'Cliente desde 2023',
  },
  {
    text: 'Atendimento excepcional! Tive um problema e resolveram em minutos. Super recomendo!',
    author: 'Pedro Santos',
    rating: 5,
    role: 'Cliente desde 2022',
  },
  {
    text: 'Qualidade dos produtos é incrível. Compro sempre e nunca me decepcionei.',
    author: 'Lucas Ferreira',
    rating: 5,
    role: 'Cliente desde 2024',
  },
]

export function About() {
  return (
    <div>
      {/* Hero Section About */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Nossa História
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 animate-slide-up">
              Transformando o comércio online desde 2020, conectando pessoas aos melhores produtos com inovação e confiança.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/catalog">
                <Button variant="white" size="lg">
                  Ver Produtos
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={28} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
                alt="Missão"
                className="rounded-2xl shadow-2xl w-full h-80 object-cover"
              />
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa Missão</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Democratizar o acesso a produtos de qualidade, oferecendo a melhor experiência de compra online através de tecnologia inovadora, atendimento humanizado e preços justos.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa Visão</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Ser referência nacional em e-commerce, reconhecida pela excelência no atendimento, curadoria de produtos e inovação constante até 2028.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Nossos Valores</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Princípios que guiam cada decisão e nos mantêm focados em entregar o melhor para você.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="group text-center p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${value.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Nossa Equipe</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Conheça as pessoas apaixonadas que tornam tudo possível.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-28 h-28 rounded-full mx-auto mb-6 object-cover ring-4 ring-blue-100"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">O que nossos clientes dizem</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            A satisfação dos nossos clientes é o nosso maior prêmio.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para começar?</h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a milhares de clientes satisfeitos e descubra uma nova forma de comprar online.
          </p>
          <Link to="/register">
            <Button variant="white" size="lg">
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
