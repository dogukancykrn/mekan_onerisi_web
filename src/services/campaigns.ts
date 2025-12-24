export interface Campaign {
  id: string;
  company: string;
  discount: string;
  description: string;
  url: string;
}

export function getCampaigns(): Campaign[] {
  return [
    {
      id: 'c1',
      company: 'KahveKafe',
      discount: '%20 İndirim',
      description: 'Sabah 09:00-11:00 arası kahve + çalışma masası kampanyası.',
      url: 'https://kahvekafe.example'
    },
    {
      id: 'c2',
      company: 'CoworkPlus',
      discount: '%15 İndirim',
      description: 'Hafta içi paketlerde aylık %15 indirim.',
      url: 'https://coworkplus.example'
    },
    {
      id: 'c3',
      company: 'OfisZone',
      discount: '%25 İndirim',
      description: 'Yeni kullanıcılar için 1 hafta ücretsiz deneme + %25 indirim.',
      url: 'https://ofiszone.example'
    }
    ,{
      id: 'c4',
      company: 'WorkBistro',
      discount: '%10 İndirim',
      description: 'Öğle arası hızlı çalışma paketi - %10 indirim ve ücretsiz çorba.',
      url: 'https://workbistro.example'
    }
  ];
}
