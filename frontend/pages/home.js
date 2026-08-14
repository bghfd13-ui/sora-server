import React, { useEffect } from 'react';
import MyDashboard from '../components/myDashboard';
import DashboardStore from '../components/myDashboard/stores/dashboardStore';
import Theme2021 from '../components/theme2021';
import AuthenticationStore from '../stores/authentication';

export default function AuthenticatedHomePage() {
  return (
    <Theme2021>
      <DashboardStore.Provider>
        <MyDashboard></MyDashboard>
      </DashboardStore.Provider>
    </Theme2021>
  );
}

export const getStaticProps = () => {
  return {
    props: {
      title: 'Home - Sora',
    },
  };
};
