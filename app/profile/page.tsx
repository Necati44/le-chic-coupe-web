import NavBar from '@/components/NavBar';
import ProfilePanel from '@/components/ProfilePanel';
import MyAppointments from '@/components/MyAppointments';
import Footer from '@/components/Footer';

export default function ProfilePage(){
  return (
    <div className="container">
      <NavBar />
      <div className="grid-2">
        <div className="card">
          <div className="header"><strong>Mes informations</strong></div>
          <div className="body"><ProfilePanel /></div>
        </div>
        <div className="card">
          <div className="header"><strong>Mes rendez-vous</strong></div>
          <div className="body"><MyAppointments /></div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
