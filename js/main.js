const menu=document.querySelector('.menu'), nav=document.querySelector('nav');
menu?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
document.getElementById('year').textContent=new Date().getFullYear();
document.querySelectorAll('form').forEach(form=>{
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const m=form.querySelector('.message');
    if(m)m.textContent='Merci. Le formulaire est prêt à être connecté au système de réception des demandes.';
    form.reset();
  });
});
