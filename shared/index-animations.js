/* ── index-animations.js ── */
/* Three.js 3D background + scroll reveal + card tilt */
(function () {
  'use strict';

  /* ============================
     1. Three.js 3D Background
     ============================ */
  var canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
  camera.position.z = 30;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  /* -- Wireframe polyhedra -- */
  var palette = [0x7c6af5, 0x50e6ff, 0xf9ca24, 0x2ecc71, 0xff6b9d];
  var geos = [
    new THREE.IcosahedronGeometry(2.2, 0),
    new THREE.OctahedronGeometry(2.0, 0),
    new THREE.DodecahedronGeometry(1.8, 0),
    new THREE.TetrahedronGeometry(2.4, 0),
    new THREE.IcosahedronGeometry(1.5, 1),
    new THREE.OctahedronGeometry(2.5, 0)
  ];

  var meshes = [];
  for (var i = 0; i < geos.length; i++) {
    var wire = new THREE.WireframeGeometry(geos[i]);
    var mat = new THREE.LineBasicMaterial({
      color: palette[i % palette.length],
      transparent: true,
      opacity: 0.18 + Math.random() * 0.12
    });
    var line = new THREE.LineSegments(wire, mat);
    line.position.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 24,
      -5 - Math.random() * 15
    );
    line.userData = {
      rx: (Math.random() - 0.5) * 0.004,
      ry: (Math.random() - 0.5) * 0.004,
      floatSpeed: 0.3 + Math.random() * 0.4,
      floatOffset: Math.random() * Math.PI * 2
    };
    scene.add(line);
    meshes.push(line);
  }

  /* -- Particle field -- */
  var pCount = 300;
  var pPositions = new Float32Array(pCount * 3);
  for (var j = 0; j < pCount; j++) {
    pPositions[j * 3]     = (Math.random() - 0.5) * 60;
    pPositions[j * 3 + 1] = (Math.random() - 0.5) * 60;
    pPositions[j * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  var pMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.35
  });
  var particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* -- Mouse parallax -- */
  var mouse = { x: 0, y: 0 };
  var target = { x: 0, y: 0 };
  window.addEventListener('mousemove', function (e) {
    mouse.x = (e.clientX / innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / innerHeight - 0.5) * 2;
  });

  /* -- Animation loop -- */
  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    // Smooth parallax
    target.x += (mouse.x * 3 - target.x) * 0.03;
    target.y += (mouse.y * 2 - target.y) * 0.03;
    camera.position.x = target.x;
    camera.position.y = -target.y;
    camera.lookAt(0, 0, 0);

    // Rotate polyhedra + float
    for (var k = 0; k < meshes.length; k++) {
      var m = meshes[k];
      m.rotation.x += m.userData.rx;
      m.rotation.y += m.userData.ry;
      m.position.y += Math.sin(t * m.userData.floatSpeed + m.userData.floatOffset) * 0.005;
    }

    // Drift particles upward
    var pos = pGeo.attributes.position.array;
    for (var p = 0; p < pCount; p++) {
      pos[p * 3 + 1] += 0.008;
      if (pos[p * 3 + 1] > 30) pos[p * 3 + 1] = -30;
    }
    pGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  /* -- Resize -- */
  window.addEventListener('resize', function () {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  /* ============================
     2. Scroll Reveal
     ============================ */
  var revealEls = document.querySelectorAll('.lesson-card, .section-heading');
  for (var r = 0; r < revealEls.length; r++) {
    revealEls[r].classList.add('reveal');
  }

  // Stagger cards within each grid
  var grids = document.querySelectorAll('.lessons');
  for (var g = 0; g < grids.length; g++) {
    var cards = grids[g].querySelectorAll('.lesson-card');
    for (var c = 0; c < cards.length; c++) {
      cards[c].style.transitionDelay = (c * 0.08) + 's';
    }
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    for (var o = 0; o < revealEls.length; o++) {
      observer.observe(revealEls[o]);
    }
  } else {
    // Fallback: show all
    for (var f = 0; f < revealEls.length; f++) {
      revealEls[f].classList.add('visible');
    }
  }

  /* ============================
     3. Card 3D Tilt on Hover
     ============================ */
  if (window.matchMedia('(hover: hover)').matches) {
    var tiltCards = document.querySelectorAll('.lesson-card:not(.soon)');
    for (var tc = 0; tc < tiltCards.length; tc++) {
      (function (card) {
        card.addEventListener('mousemove', function (e) {
          var rect = card.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = (e.clientX - cx) / (rect.width / 2);
          var dy = (e.clientY - cy) / (rect.height / 2);
          // Glow follows cursor
          var px = ((e.clientX - rect.left) / rect.width * 100);
          var py = ((e.clientY - rect.top) / rect.height * 100);
          card.style.setProperty('--glow-x', px + '%');
          card.style.setProperty('--glow-y', py + '%');
          card.style.transform =
            'perspective(600px) rotateY(' + (dx * 8) + 'deg) rotateX(' + (-dy * 8) + 'deg) translateY(-6px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function () {
          card.style.transform = '';
        });
      })(tiltCards[tc]);
    }
  }
})();
