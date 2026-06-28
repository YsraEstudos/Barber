import type { Barber, Service } from "@/lib/types";

export const fallbackServices: Service[] = [
  {
    id: "f0000000-0000-0000-0000-000000000001",
    name: "Corte de Cabelo",
    description: "Corte clássico ou moderno, com finalização premium.",
    duration_minutes: 45,
    price_cents: 6000,
    active: true,
  },
  {
    id: "f0000000-0000-0000-0000-000000000002",
    name: "Combo Vip",
    description: "Corte de cabelo e barba com toalha quente e massagem facial.",
    duration_minutes: 75,
    price_cents: 11000,
    active: true,
  },
  {
    id: "f0000000-0000-0000-0000-000000000003",
    name: "Barba Tradicional",
    description: "Alinhamento perfeito, toalha quente e óleos essenciais.",
    duration_minutes: 30,
    price_cents: 4500,
    active: true,
  },
  {
    id: "f0000000-0000-0000-0000-000000000004",
    name: "Coloração",
    description: "Disfarce de fios brancos com pigmentação natural.",
    duration_minutes: 40,
    price_cents: 7000,
    active: true,
  },
];

export const fallbackBarbers: Barber[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    name: "Carlos Silva",
    bio: "Especialista em Fade & Barba Tradicional",
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDetWuc1niYUYmB-3ujxbnjtFFBjUcYrEpElTieV30Jk1k-erQlZsQCgPqxn41ADnvQPezt1BkHJib8q7_9U6sax4n8MwlcDvW9jF8Wvyc4lnEoNeHBzX2HCZkFZkp8EcmQaI5lkTArIfsHPM2m2yXMw7mQJ_omUfeGo0goI8oUltpylQDoduAbKwGkIeuUF4fDyhhcF3l1Fc7QtnNGufLJ0_qgqmiX88cS7lvB9HraMvh9X_iEgul5UQu4kGEaozWdrsMUpbRODQM",
    active: true,
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    name: "Miguel Santos",
    bio: "Mestre em Tesoura & Textura",
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2FkzJ61IifjIbCXpyM44n-zkFxBjmOX6fbZGw_RMpJA_LMKYvaDNKZCWbqqSU9Ilx8-4AqTA4A23LdsAgubTlBcQQhuP_Wb0Q7htynOViuqnxqyD8g27Z7NYoztB05rTLCTop1A-t4aAYHXTKgK3GUlS2013hz-rrDvlBKYQ813v5XEHTuJarx4u23GtYwzFdZ46LX36LyvC286z6E9Ki6rJundsk1P-zX-9x792ODdZRna3pLewGQS4ylEsN19xvnnAyn1YnUPw",
    active: true,
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    name: "Alexandre Costa",
    bio: "Consultoria de Imagem & Cortes Premium",
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXA7et8yIMLDl0g7Zq3dFNtDxGYHuPbrKCtzyaVmj9dYRscUalnEjxiAF0ccc7Ww3zG3lWb8qkMayzLA-5-kKrUJ-n7yO9_VoriIq9IBAGUFL-MSOw7tiZHHGzseL5_aRIT285AR6QPBPh5Z4DJn9CqR7_CjeRt3gjGQxeyplaR84rf-hUdFqZAg6YiU8hZwYv1NM0lPyLMdNARHCTtKVQtQLspbnB7gsGt7w3L29TCoxBq4OCGSpBx2qvXUCOzdcc-hPmey4dNzM",
    active: true,
  },
];
