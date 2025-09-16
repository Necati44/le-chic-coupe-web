import NavBar from '@/components/NavBar';
import AdminPanel from '@/components/AdminPanel';
import Footer from '@/components/Footer';

export default function AdminPage(){
  return (
    <div className="container">
      <NavBar />
      <div className="card">
        <div className="header"><strong>Back-office</strong></div>
        <div className="body"><AdminPanel /></div>
      </div>
      <Footer />
    </div>
  );
}
