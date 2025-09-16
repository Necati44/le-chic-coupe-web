import NavBar from '@/components/NavBar';
import ServicesList from '@/components/ServicesList';
import Footer from '@/components/Footer';

export default function HomePage(){
  return (
    <div className="container">
      <NavBar />
      <div className="hero">
        <h1 style={{margin:0}}>Votre prochain look commence ici ✂️</h1>
        <p className="small">Réservez en ligne en quelques clics. Équipe passionnée, prestations soignées.</p>
      </div>

      <div style={{marginTop:16}} className="grid">
        <div className="card">
          <div className="header"><strong>Nos services</strong></div>
          <div className="body"><ServicesList /></div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
