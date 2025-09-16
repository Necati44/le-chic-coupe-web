// app/profile/page.tsx
'use client'

import NavBar from '@/components/NavBar';
import ProfilePanel from '@/components/ProfilePanel';
import MyAppointments from '@/components/MyAppointments';
import Footer from '@/components/Footer';



import DemoAppointmentsList from '@/components/DemoAppointmentsList';

export default function ProfilePage(){
  return (
    <div className="container">
      <div className="card">
        <div className="header"><div className="title">Mon espace</div></div>
        <div className="body">
          {/* ... ton contenu actuel (infos compte, etc.) ... */}
          <div style={{marginTop:16}}>
            <DemoAppointmentsList />
          </div>
        </div>
      </div>
    </div>
  );
}


