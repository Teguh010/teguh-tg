"use client"
import { useEffect, useState } from 'react';
import LayoutLoader from "@/components/layout-loader";

const withAuth = (WrappedComponent) => {
    const Wrapper = (props) => {
        const [userData, setUserData] = useState(null);

        useEffect(() => {
            const storedUserData = JSON.parse(localStorage.getItem('userData'));
            setUserData(storedUserData);

            if (!storedUserData?.token) {
                window.location.assign("/");
            }
        }, []);

        if (!userData) {
            return <LayoutLoader />;
        }

        return userData?.token ? <WrappedComponent {...props} /> : null;
    };

    if (WrappedComponent.getInitialProps) {
        Wrapper.getInitialProps = WrappedComponent.getInitialProps;
    }

    return Wrapper;
};

export default withAuth;

