// Production'da aynı domain'i kullan, development'ta localhost
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'  // Local development
  : '/api';  // Vercel'de aynı domain

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  // Token'ı localStorage'a kaydet
  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  // Token'ı al
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Token'ı sil
  removeToken() {
    localStorage.removeItem('token');
  }

  // Kullanıcı bilgisini kaydet
  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Kullanıcı bilgisini al
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Kullanıcı bilgisini sil
  removeUser() {
    localStorage.removeItem('user');
  }

  // Kayıt ol
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Kayıt başarısız');
    }

    this.setToken(result.token);
    this.setUser(result.user);

    return result;
  }

  // Giriş yap
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Giriş başarısız');
    }

    this.setToken(result.token);
    this.setUser(result.user);

    return result;
  }

  // Çıkış yap
  logout() {
    this.removeToken();
    this.removeUser();
  }

  // Kullanıcı giriş yapmış mı?
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Kullanıcı bilgisini API'den al
  async getCurrentUser(): Promise<User> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Token bulunamadı');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Kullanıcı bilgisi alınamadı');
    }

    return result.user;
  }
}

export const authService = new AuthService();
