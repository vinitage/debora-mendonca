# Débora Mendonça

Landing Page profissional da **Débora Mendonça**, neuropsicóloga infantil e adulta em Araraquara/SP, CRP 06/184784, coordenadora do Instituto Ludo.

🔗 **Site:** [neuropsideboramendonca.com.br](https://neuropsideboramendonca.com.br)

## Sobre o projeto

Página única construída para conversão direta e autoridade clínica:

- **Conversão** → CTA de WhatsApp distribuído ao longo da página, com mensagens distintas por seção (agendamento, dúvidas, orçamento)
- **Autoridade local** → prova social (avaliações reais do Google), certificações, galeria de atendimento com lightbox, FAQ otimizado para AEO e seção "Como Funciona" com o passo a passo da avaliação

Inclui schema `MedicalBusiness` + `Person` + `FAQPage` + `HowTo`, avaliações reais do Google Meu Negócio e endereço com NAP consistente.

## Stack

- HTML5 semântico
- CSS3 (custom properties, arquivo único — sem pré-processador)
- JavaScript vanilla (accordion do FAQ, carrossel de depoimentos, lightbox da galeria, contador animado, scroll reveal via IntersectionObserver)
- Google Fonts: Cormorant Garamond + Plus Jakarta Sans

Sem framework, sem build step — arquivo único, deploy direto.

## Estrutura

```
├── index.html        # página única
├── css/style.css      # arquivo único
├── js/main.js          # arquivo único
├── images/             # fotos, logo, favicons
├── favicon.ico
├── robots.txt
├── sitemap.xml
└── .htaccess            # HTTPS, headers de segurança, cache e compressão
```

## Identidade Visual

```css
--roxo-primary:  #6B3FA0   /* roxo principal */
--roxo-mid:      #8B5CC8
--lilas-accent:  #C4A8E0
--cream:         #FEFCFF   /* fundo principal */
--text-dark:     #1A1025
```

Heading em Cormorant Garamond, corpo em Plus Jakarta Sans — tom acolhedor e clínico, remetendo a cuidado e precisão técnica.

## SEO & Performance

- Meta tags completas (title, description, Open Graph, Twitter Card)
- Schema.org (`MedicalBusiness`, `Person`, `FAQPage`, `HowTo`) para rich results no Google
- Imagens com `width`/`height`, `loading` e `decoding` corretos
- Mobile-first, testado em 375px–1440px
- Metas de performance: LCP < 2,5s · CLS < 0,1 · PageSpeed Mobile > 85

---

Desenvolvido por [Vinta Digital](https://vndigital.site) — posicionamento digital para negócios locais.
