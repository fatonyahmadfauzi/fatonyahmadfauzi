let tl = gsap.timeline({ repeat: -1 });

gsap.set('ellipse', {autoAlpha: 0})

gsap.set('#hello-text', {scale: 0.5, transformOrigin: '50% 50%'})

tl
.to("ellipse", { autoAlpha: 1, duration: 1, stagger: 0.05, ease: "power4.out" })
.to('#hello-text', {scale: 1, duration: 50}, "<")

tl.timeScale(8);