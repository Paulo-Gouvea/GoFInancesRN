import React, { 
    createContext, 
    ReactNode,
    useContext, 
} from 'react';

interface AuthProviderProps {
    children: ReactNode;
}

interface User {
    id: string;
    name: string;
    email: string;
    photo?: string;
}

interface AuthContextData {
    user: User;
}

// O contexto
const AuthContext = createContext({} as AuthContextData);

// O provider
function AuthProvider({ children }: AuthProviderProps){
    const user = {
        id: '12345',
        name: 'Paulo Gouvêa',
        email: 'paulo@email.com'
    };

    return (
        <AuthContext.Provider 
            value={{
                user,
            }}
        >
            { children }
        </AuthContext.Provider>        
    )
}

// O hook
function useAuth(){
    const context = useContext(AuthContext);  

    return context;
}

export { AuthProvider, useAuth }