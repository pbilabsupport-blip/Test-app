import React from 'react';

const FinancialGlossaryModal = ({ language, closeModal }) => {
const glossaryTerms = [
    // --- THE RICH DAD CORE ---
    {
      en_term: "Asset", es_term: "Activo",
      en_def: "Something that puts money into your pocket, whether you work or not (like rental property, software, or dividend stocks).",
      es_def: "Algo que pone dinero en tu bolsillo, trabajes o no (como propiedades de alquiler, software o acciones que pagan dividendos)."
    },
    {
      en_term: "Liability", es_term: "Pasivo",
      en_def: "Something that takes money out of your pocket every month (like a car payment, a mortgage on your personal home, or credit card debt).",
      es_def: "Algo que saca dinero de tu bolsillo cada mes (como el pago de un auto, la hipoteca de tu casa personal o deuda de tarjeta de crédito)."
    },
    {
      en_term: "Cash Flow", es_term: "Flujo de Efectivo",
      en_def: "The actual money left over at the end of the month after all your expenses and liabilities are paid. This is the ultimate goal of financial freedom.",
      es_def: "El dinero real que sobra al final del mes después de pagar todos tus gastos y pasivos. Este es el objetivo final de la libertad financiera."
    },
    {
      en_term: "OPM (Other People's Money)", es_term: "Dinero de Otros (OPM)",
      en_def: "Using bank loans or investor capital to buy an asset, rather than using your own savings. This allows you to grow wealthy much faster.",
      es_def: "Usar préstamos bancarios o capital de inversores para comprar un activo, en lugar de usar tus propios ahorros. Esto te permite enriquecerte mucho más rápido."
    },

    // --- BANKING & REAL ESTATE ---
    {
      en_term: "Amortization", es_term: "Amortización",
      en_def: "The schedule of paying off a debt over time in equal chunks (like a 30-year house loan). At first, mostly interest is paid; later, mostly the principal.",
      es_def: "El calendario para pagar una deuda a lo largo del tiempo en partes iguales (como un préstamo hipotecario a 30 años). Al principio, se paga mayormente interés; luego, el capital."
    },
    {
      en_term: "Collateral", es_term: "Garantía (Colateral)",
      en_def: "Something valuable (like a house or car) that you promise to give the bank if you fail to pay back a loan.",
      es_def: "Algo de valor (como una casa o un auto) que prometes entregar al banco si no logras pagar un préstamo."
    },
    {
      en_term: "Leverage", es_term: "Apalancamiento",
      en_def: "Using borrowed money to buy a larger asset than you could afford with just your own cash, multiplying your potential profits.",
      es_def: "Usar dinero prestado para comprar un activo más grande del que podrías pagar solo con tu efectivo, multiplicando tus ganancias potenciales."
    },
    {
      en_term: "Capital Gains", es_term: "Ganancias de Capital",
      en_def: "The profit you make when you sell an asset for more than you bought it for. (e.g., Buying a house for $100k and selling it for $150k).",
      es_def: "La ganancia que obtienes cuando vendes un activo por más de lo que te costó. (Ej. Comprar una casa por $100k y venderla por $150k)."
    },
    {
      en_term: "Net Worth", es_term: "Valor Neto",
      en_def: "The total value of everything you own (Assets) minus everything you owe (Liabilities).",
      es_def: "El valor total de todo lo que posees (Activos) menos todo lo que debes (Pasivos)."
    },

    // --- BUSINESS & SHARK TANK TERMS ---
    {
      en_term: "Equity", es_term: "Capital (Participación)",
      en_def: "The percentage of a business or property that you actually own free and clear. If a Shark asks for 10% equity, they want to own 10% of your company.",
      es_def: "El porcentaje de un negocio o propiedad que realmente posees libre de deudas. Si un inversor pide el 10% de capital, quiere ser dueño del 10% de tu empresa."
    },
    {
      en_term: "Valuation", es_term: "Valoración",
      en_def: "What a company is mathematically worth. If you offer 10% of your company for $100,000, you are implying the total valuation is $1,000,000.",
      es_def: "Lo que matemáticamente vale una empresa. Si ofreces el 10% de tu empresa por $100,000, estás implicando que la valoración total es de $1,000,000."
    },
    {
      en_term: "Profit Margin", es_term: "Margen de Ganancia",
      en_def: "The percentage of money you keep from a sale after paying the costs to make the product. High margins mean a highly profitable business.",
      es_def: "El porcentaje de dinero que conservas de una venta después de pagar los costos para hacer el producto. Márgenes altos significan un negocio muy rentable."
    },
    {
      en_term: "Liquid", es_term: "Líquido",
      en_def: "How fast you can turn an asset into cold, hard cash without losing money. A bank account is highly liquid; real estate is not.",
      es_def: "Qué tan rápido puedes convertir un activo en dinero en efectivo sin perder valor. Una cuenta bancaria es muy líquida; los bienes raíces no lo son."
    },
    {
      en_term: "ROI (Return on Investment)", es_term: "Retorno de Inversión (ROI)",
      en_def: "A percentage showing how much profit you made compared to the money you put in. If you invest $100 and make $10, your ROI is 10%.",
      es_def: "Un porcentaje que muestra cuánta ganancia obtuviste en comparación con el dinero que invertiste. Si inviertes $100 y ganas $10, tu ROI es del 10%."
    },
    {
      en_term: "CAC (Customer Acquisition Cost)", es_term: "Costo de Adquisición de Clientes (CAC)",
      en_def: "Exactly how much money you have to spend on marketing and ads to get one single new paying customer.",
      es_def: "Exactamente cuánto dinero tienes que gastar en marketing y anuncios para conseguir un solo cliente nuevo que pague."
    },
    {
      en_term: "Seed Money", es_term: "Capital Semilla",
      en_def: "The very first round of money used to start a business or build a prototype before the company is actually making a profit.",
      es_def: "La primera ronda de dinero utilizada para iniciar un negocio o construir un prototipo antes de que la empresa realmente esté generando ganancias."
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content kiyosaki-modal">
        <h2>{language === 'es' ? 'Glosario de Educación Financiera' : 'Financial Literacy Glossary'}</h2>
        <p className="modal-subtitle">
          {language === 'es' 
            ? 'Basado en los principios de Padre Rico, Padre Pobre.' 
            : 'Based on the principles of Rich Dad, Poor Dad.'}
        </p>

        <div className="glossary-list">
          {glossaryTerms.map((item, index) => (
            <div key={index} className="glossary-item">
              <h3>{language === 'es' ? item.es_term : item.en_term}</h3>
              <p>{language === 'es' ? item.es_def : item.en_def}</p>
            </div>
          ))}
        </div>

        <button className="close-btn" onClick={closeModal}>
          {language === 'es' ? 'Cerrar' : 'Close'}
        </button>
      </div>
    </div>
  );
};

export default FinancialGlossaryModal;