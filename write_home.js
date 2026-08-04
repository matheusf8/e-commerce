const fs = require("fs");
const content = `import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";

export function Home() {
  return (
    <div>
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Bem-vindo ao E-Shop</h1>
          <p className="text-xl mb-8 opacity-90 text-white">Os melhores produtos com precos incriveis</p>
          <Link to="/catalog"><Button variant="white" size="lg">Explorar Produtos</Button></Link>
        </div>
      </section>
    </div>
  );
}
`;
fs.writeFileSync("c:/Users/mathe/OneDrive/Desktop/area_trabalho/pasta/sistema-de-E-commerce/frontend/src/pages/Home.tsx", content, "utf8");
console.log("Written successfully");
