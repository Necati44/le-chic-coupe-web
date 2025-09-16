import NavBar from '@/components/NavBar';
import SignInPanel from '@/components/SignInPanel';
import Footer from '@/components/Footer';

export default function SignInPage(){
  return (
    <div className="container">
      <NavBar />
      <div className="card">
        <div className="header"><strong>Connexion</strong></div>
        <div className="body"><SignInPanel /></div>
      </div>
      <Footer />
    </div>
  );
}
