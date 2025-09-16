import NavBar from '@/components/NavBar';
import BookingFlow from '@/components/BookingFlow';
import Footer from '@/components/Footer';

export default function BookPage(){
  return (
    <div className="container">
      <NavBar />
      <div className="card">
        <div className="header"><strong>Réserver un rendez-vous</strong></div>
        <div className="body">
          <BookingFlow />
        </div>
      </div>
      <Footer />
    </div>
  );
}
