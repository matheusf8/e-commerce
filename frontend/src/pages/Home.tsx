import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, CreditCard, HeadphonesIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProductGrid } from "@/components/product/ProductGrid";
import { productService } from "@/services/api";
import { siteConfig } from "@/config/site";

// Cores de fundo dos cards de categoria na Home, aplicadas em ordem e
// repetidas se houver mais categorias reais do que cores na lista.
const CATEGORY_TILE_COLORS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-pink-500 to-pink-700",
  "from-green-500 to-green-700",
];

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryTiles, setCategoryTiles] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    loadFeaturedProducts();
    loadCategoryTiles();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await productService.getFeatured();
      setFeaturedProducts(Array.isArray(response.data) ? response.data : response.data?.items || []);
    } catch (error) {
      console.error("Failed to load featured products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Antes, essas 4 categorias e seus totais ("45 produtos" etc.) eram fixos
  // no código — sobra de template que não batia com o catálogo real (tinha
  // categoria "Moda"/"Casa" que nunca existiu, e contagem inventada).
  // Agora busca as categorias reais e o total de cada uma na API, então
  // sempre reflete o catálogo de verdade, seja qual for o cliente.
  const loadCategoryTiles = async () => {
    try {
      const categoriesRes = await productService.getCategories();
      const names: string[] = categoriesRes.data?.categories || [];
      const withCounts = await Promise.all(
        names.map(async (name) => {
          const res = await productService.getAll(0, 1, name);
          return { name, count: res.data?.total ?? 0 };
        })
      );
      setCategoryTiles(withCounts.filter((c) => c.count > 0));
    } catch (error) {
      console.error("Failed to load category tiles:", error);
    }
  };

  const benefits = [
    { icon: Truck, title: "Frete Gratis", desc: "Em compras acima de R$ 200" },
    { icon: Shield, title: "Compra Segura", desc: "Dados protegidos com criptografia" },
    { icon: CreditCard, title: "Parcele em 12x", desc: "No cartao de credito" },
    { icon: HeadphonesIcon, title: "Suporte 24/7", desc: "Atendimento online" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 text-sm">
              <Zap size={16} className="text-yellow-300" />
              <span>Nova colecao 2024 com ate 40% OFF</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Descubra o{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 text-transparent bg-clip-text">
                Melhor
              </span>{" "}
              em Tecnologia
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
              {siteConfig.tagline}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog">
                <Button variant="white" size="lg" className="text-blue-700 font-bold text-lg px-8 py-4">
                  Ver Catalogo
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4">
                  Sobre Nos
                </Button>
              </Link>
            </div>
            
            {/* "4.9 de 5 estrelas" / "+10.000 clientes" eram números fixos no
                código, sem nenhum dado real por trás — propaganda enganosa
                pra uma loja nova. Só aparecem agora se VITE_SITE_RATING /
                VITE_SITE_CUSTOMER_COUNT forem preenchidos com métricas reais. */}
            <div className="mt-16 flex items-center justify-center gap-8 text-sm flex-wrap">
              {siteConfig.rating && (
                <>
                  <div className="flex items-center gap-2">
                    <Star size={20} className="text-yellow-300 fill-yellow-300" />
                    <span>{siteConfig.rating}</span>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                </>
              )}
              {siteConfig.customerCount && (
                <>
                  <span>{siteConfig.customerCount}</span>
                  <div className="w-px h-8 bg-white/20"></div>
                </>
              )}
              <span>Entrega em todo Brasil</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon size={28} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Produtos em Destaque</h2>
              <p className="text-gray-600 mt-2">Os produtos mais vendidos da semana</p>
            </div>
            <Link to="/catalog">
              <Button variant="outline">
                Ver Todos <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>
          <ProductGrid products={featuredProducts} isLoading={isLoading} />
        </div>
      </section>

      {/* Categories */}
      {categoryTiles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categoryTiles.map((cat, index) => (
                <Link key={cat.name} to={"/catalog?category=" + cat.name} className="group">
                  <div className={"relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br " + CATEGORY_TILE_COLORS[index % CATEGORY_TILE_COLORS.length]}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                        <p className="text-sm text-white/80">{cat.count} produto{cat.count !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto para Comprar?</h2>
          <p className="text-xl text-blue-100 mb-8">Cadastre-se agora e ganhe 10% de desconto na primeira compra!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="white" size="lg" className="text-blue-700 font-bold px-8">
                Criar Conta Gratis
              </Button>
            </Link>
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8">
                Continuar Navegando
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Fique por Dentro</h3>
          <p className="text-gray-400 mb-6">Receba ofertas exclusivas e novidades no seu email</p>
          <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6">
              Inscrever
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

