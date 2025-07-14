import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import '../style/CubeAnimation.css';

const CubeAnimation = () => {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const animatingCubesRef = useRef([]);
    const staticSquaresRef = useRef([]);
    const materialsRef = useRef([]);

    // ========== VARIÁVEIS DE CONTROLE ==========
    const CONFIG = {
        // Tamanho dos quadrados
        squareSizeMin: 1.0,        // Tamanho mínimo dos quadrados
        squareSizeMax: 2.0,        // Tamanho máximo dos quadrados

        // Quantidade de quadrados
        squaresPerSideDesktop: 20, // Quantidade de quadrados por lado no desktop
        squaresPerSideMobile: 20,  // Quantidade de quadrados por lado no mobile

        // Distância entre cubos
        spacingX: 0.3,             // Espaçamento mínimo horizontal entre cubos (0 = permite overlap total)
        spacingY: 0.3,             // Espaçamento mínimo vertical entre cubos (0 = permite overlap total)
        allowOverlap: true,        // Se true, ignora completamente o check de overlap

        // Animação
        animationDuration: 6000,   // Duração da animação em ms
        movementSpeed: 8.5,        // Velocidade do movimento lateral
        rotationSpeedX: 1.57,      // Velocidade de rotação X (~90 graus)
        rotationSpeedY: 2.36,      // Velocidade de rotação Y (~135 graus)
        extrusionSpeed: 0.5,       // Velocidade da extrusão (menor = mais rápido)

        // Frequência e quantidade
        animationInterval: 1000,   // Intervalo entre grupos de animações em ms
        cubesPerBatchDesktop: 3,   // Quantidade de cubos por vez no desktop
        cubesPerBatchMobile: 2,    // Quantidade de cubos por vez no mobile

        // Opacidade e visibilidade
        initialOpacity: 0.5,         // Opacidade inicial
        staticSquareOpacity: 0.5,  // Opacidade dos quadrados estáticos
        visibleAreaProgress: 0.2,  // Até que % do movimento o cubo permanece visível (0.8 = 80%)
        fadeOutDuration: 0.1,      // Duração do fade out como % do total (0.2 = últimos 20%)
        darkOverlayOpacity: 0.988,   // Opacidade do overlay preto (0 = sem overlay, 1 = totalmente preto)
        hoverDarkOverlayReduction: 0.8, // Quanto o hover reduz o overlay (0.7 = 70% de redução)

        // Área de distribuição
        sideWidth: 2.0,              // Largura da faixa lateral onde os quadrados aparecem
        positionRandomness: 0.3,   // Aleatoriedade da posição (0-1)

        // Cores - Vibração e Saturação
        colorVibrance: 1.0,        // Multiplicador de vibração (1 = normal, >1 = mais vibrante)
        colorSaturation: 1.0,      // Saturação das cores (0 = cinza, 1 = normal, >1 = super saturado)
        colorBrightness: 1.0,      // Brilho das cores (1 = normal)

        // Gradientes
        gradientAngles: [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330],

        // Cores do gradiente base
        gradientColors: [
            { stop: 0, color: '#000000' },
            { stop: 0.4, color: '#0C8BD2' },
            { stop: 0.7, color: '#2DD6A3' },
            { stop: 0.9, color: '#E7DC52' },
        ]
    };

    useEffect(() => {
        // Setup básico
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true
        });
        renderer.setClearColor(0x000000, 0); // preto com 0 de opacidade = totalmente transparente
        rendererRef.current = renderer;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Função para ajustar cor com vibração e saturação
        const adjustColor = (hexColor) => {
            // Se não há ajustes, retorna a cor original
            if (CONFIG.colorVibrance === 1 && CONFIG.colorSaturation === 1 && CONFIG.colorBrightness === 1) {
                return hexColor;
            }

            const color = new THREE.Color(hexColor);

            // Converter para HSL
            const hsl = {};
            color.getHSL(hsl);

            // Aplicar saturação (clamped entre 0 e 1)
            hsl.s = Math.max(0, Math.min(1, hsl.s * CONFIG.colorSaturation));

            // Aplicar brilho (clamped entre 0 e 1)
            hsl.l = Math.max(0, Math.min(1, hsl.l * CONFIG.colorBrightness));

            // Converter de volta
            color.setHSL(hsl.h, hsl.s, hsl.l);

            // Aplicar vibração de forma mais sutil
            if (CONFIG.colorVibrance !== 1) {
                const vibranceFactor = CONFIG.colorVibrance;
                // Aplicar vibração apenas nas cores mais saturadas
                const gray = (color.r + color.g + color.b) / 3;
                color.r = gray + (color.r - gray) * vibranceFactor;
                color.g = gray + (color.g - gray) * vibranceFactor;
                color.b = gray + (color.b - gray) * vibranceFactor;

                // Garantir que os valores fiquem entre 0 e 1
                color.r = Math.max(0, Math.min(1, color.r));
                color.g = Math.max(0, Math.min(1, color.g));
                color.b = Math.max(0, Math.min(1, color.b));
            }

            return '#' + color.getHexString();
        };

        // Função para criar gradiente com ângulo variado usando CSS linear-gradient approach
        const createGradientTexture = (angle = 45, isHovered = false) => {
            const gradientCanvas = document.createElement('canvas');
            gradientCanvas.width = 512;
            gradientCanvas.height = 512;
            const ctx = gradientCanvas.getContext('2d');

            // Calcular pontos do gradiente baseado no ângulo
            const angleRad = (angle * Math.PI) / 180;
            
            // Para replicar o comportamento do CSS linear-gradient
            const diagonal = Math.sqrt(gradientCanvas.width * gradientCanvas.width + gradientCanvas.height * gradientCanvas.height);
            const centerX = gradientCanvas.width / 2;
            const centerY = gradientCanvas.height / 2;
            
            // Calcular os pontos inicial e final do gradiente
            const x1 = centerX - (diagonal / 2) * Math.cos(angleRad);
            const y1 = centerY - (diagonal / 2) * Math.sin(angleRad);
            const x2 = centerX + (diagonal / 2) * Math.cos(angleRad);
            const y2 = centerY + (diagonal / 2) * Math.sin(angleRad);

            // Criar gradiente linear
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            
            // Calcular a opacidade do overlay baseado no hover
            const effectiveOverlayOpacity = isHovered 
                ? CONFIG.darkOverlayOpacity * (1 - CONFIG.hoverDarkOverlayReduction)
                : CONFIG.darkOverlayOpacity;
            
            // Adicionar as cores do gradiente com escurecimento aplicado
            CONFIG.gradientColors.forEach(({ stop, color }) => {
                // Aplicar escurecimento diretamente nas cores
                if (effectiveOverlayOpacity > 0) {
                    const originalColor = new THREE.Color(adjustColor(color));
                    // Escurecer a cor multiplicando por (1 - darkOverlayOpacity)
                    const darkness = 1 - effectiveOverlayOpacity;
                    originalColor.r *= darkness;
                    originalColor.g *= darkness;
                    originalColor.b *= darkness;
                    gradient.addColorStop(stop, '#' + originalColor.getHexString());
                } else {
                    gradient.addColorStop(stop, adjustColor(color));
                }
            });

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);

            // Criar textura com configurações para evitar estouro
            const texture = new THREE.CanvasTexture(gradientCanvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;

            return texture;
        };

        // Criar vários materiais com gradientes em ângulos diferentes
        const createMaterials = () => {
            return CONFIG.gradientAngles.map(angle => {
                return new THREE.MeshBasicMaterial({
                    map: createGradientTexture(angle),
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: CONFIG.staticSquareOpacity
                });
            });
        };

        const materials = createMaterials();
        materialsRef.current = materials;

        // Posição da câmera
        camera.position.z = 8;
        camera.position.y = 0;
        camera.lookAt(0, 0, 0);

        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Função para verificar sobreposição com tamanhos variáveis
        const checkOverlap = (x, y, size, existingSquares) => {
            if (CONFIG.allowOverlap) return false; // Se permitir overlap, sempre retorna false

            for (let square of existingSquares) {
                const dx = Math.abs(x - square.x);
                const dy = Math.abs(y - square.y);
                const minDistanceX = (size + square.size) / 2 + CONFIG.spacingX;
                const minDistanceY = (size + square.size) / 2 + CONFIG.spacingY;
                if (dx < minDistanceX && dy < minDistanceY) {
                    return true;
                }
            }
            return false;
        };

        // Função para gerar tamanho aleatório
        const getRandomSize = () => {
            return CONFIG.squareSizeMin + Math.random() * (CONFIG.squareSizeMax - CONFIG.squareSizeMin);
        };

        // Função para criar quadrados estáticos nas laterais com posições aleatórias
        const createStaticSquares = () => {
            // Calcular limites da área visível
            const viewHeight = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
            const viewWidth = viewHeight * camera.aspect;

            // Posições das faixas laterais com mais variação
            const leftCenterX = -viewWidth / 2 + CONFIG.sideWidth / 2;
            const rightCenterX = viewWidth / 2 - CONFIG.sideWidth / 2;

            // Número de quadrados por lado
            const isMobile = window.innerWidth < 768;
            const squaresPerSide = isMobile ? CONFIG.squaresPerSideMobile : CONFIG.squaresPerSideDesktop;

            // Arrays para armazenar posições já usadas
            const leftPositions = [];
            const rightPositions = [];

            // Criar quadrados na lateral esquerda
            for (let i = 0; i < squaresPerSide; i++) {
                let x, y, size;
                let attempts = 0;
                const maxAttempts = CONFIG.allowOverlap ? 1 : 100; // Se permitir overlap, não tenta múltiplas vezes

                do {
                    size = getRandomSize();
                    // Mais aleatoriedade na posição
                    const randomOffsetX = (Math.random() - 0.5) * CONFIG.sideWidth * CONFIG.positionRandomness;
                    const randomOffsetY = (Math.random() - 0.5) * 0.5;

                    x = leftCenterX + randomOffsetX + (Math.random() - 0.5) * CONFIG.sideWidth;
                    y = (Math.random() - 0.5) * (viewHeight + size) + randomOffsetY;
                    attempts++;
                } while (checkOverlap(x, y, size, leftPositions) && attempts < maxAttempts);

                leftPositions.push({ x, y, size });

                const planeGeometry = new THREE.PlaneGeometry(size, size);
                const materialIndex = Math.floor(Math.random() * materials.length);
                const square = new THREE.Mesh(planeGeometry, materials[materialIndex]);
                square.position.set(x, y, 0);

                // Adicionar pequena rotação aleatória para mais variação visual
                square.rotation.z = 0;

                square.userData = {
                    side: 'left',
                    index: i,
                    originalX: x,
                    originalY: y,
                    size: size,
                    materialIndex: materialIndex
                };
                scene.add(square);
                staticSquaresRef.current.push(square);
            }

            // Criar quadrados na lateral direita
            for (let i = 0; i < squaresPerSide; i++) {
                let x, y, size;
                let attempts = 0;
                const maxAttempts = CONFIG.allowOverlap ? 1 : 100;

                do {
                    size = getRandomSize();
                    // Mais aleatoriedade na posição
                    const randomOffsetX = (Math.random() - 0.5) * CONFIG.sideWidth * CONFIG.positionRandomness;
                    const randomOffsetY = (Math.random() - 0.5) * 0.5;

                    x = rightCenterX + randomOffsetX + (Math.random() - 0.5) * CONFIG.sideWidth;
                    y = (Math.random() - 0.5) * (viewHeight + size) + randomOffsetY;
                    attempts++;
                } while (checkOverlap(x, y, size, rightPositions) && attempts < maxAttempts);

                rightPositions.push({ x, y, size });

                const planeGeometry = new THREE.PlaneGeometry(size, size);
                const materialIndex = Math.floor(Math.random() * materials.length);
                const square = new THREE.Mesh(planeGeometry, materials[materialIndex]);
                square.position.set(x, y, 0);

                // Adicionar pequena rotação aleatória
                square.rotation.z = 0;

                square.userData = {
                    side: 'right',
                    index: i,
                    originalX: x,
                    originalY: y,
                    size: size,
                    materialIndex: materialIndex
                };
                scene.add(square);
                staticSquaresRef.current.push(square);
            }
        };

        // Criar quadrados estáticos
        createStaticSquares();

        // Classe para gerenciar cada cubo animado
        class AnimatingCube {
            constructor(startX, startY, targetDirection, materialIndex, size) {
                // Criar material animado com o mesmo gradiente do quadrado original
                const angle = CONFIG.gradientAngles[materialIndex % CONFIG.gradientAngles.length];
                this.animatedMaterial = new THREE.MeshBasicMaterial({
                    map: createGradientTexture(angle),
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: CONFIG.initialOpacity
                });

                // Criar geometria inicial muito fina
                this.size = size;
                this.geometry = new THREE.BoxGeometry(size, size, 0.01);
                this.mesh = new THREE.Mesh(this.geometry, this.animatedMaterial);

                // Posicionar na posição do quadrado de origem
                this.mesh.position.x = startX;
                this.mesh.position.y = startY;
                this.mesh.position.z = 0.01;

                // Direção do movimento (1 para direita, -1 para esquerda)
                this.targetDirection = targetDirection;

                scene.add(this.mesh);

                this.startTime = Date.now();
                this.animationDuration = CONFIG.animationDuration;
                this.isComplete = false;
                this.startX = startX;
                this.startY = startY;
            }

            update() {
                if (this.isComplete) return;

                const currentTime = Date.now();
                const elapsed = currentTime - this.startTime;
                const progress = Math.min(elapsed / this.animationDuration, 1);

                // Easing function
                const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                const easedProgress = easeInOut(progress);

                // Extrusão
                const extrusionProgress = Math.pow(progress, CONFIG.extrusionSpeed);
                const newDepth = 0.01 + (this.size - 0.01) * extrusionProgress;

                // Recriar geometria
                this.mesh.geometry.dispose();
                this.mesh.geometry = new THREE.BoxGeometry(this.size, this.size, newDepth);

                // Rotação
                this.mesh.rotation.x = CONFIG.rotationSpeedX * easedProgress;
                this.mesh.rotation.y = CONFIG.rotationSpeedY * easedProgress;

                // Movimento lateral
                this.mesh.position.x = this.startX + (this.targetDirection * easedProgress * CONFIG.movementSpeed);

                // Movimento para frente
                this.mesh.position.z = 0.01 + easedProgress * 1;

                // Manter altura
                this.mesh.position.y = this.startY;

                // Fade out baseado na área visível configurada
                if (progress > CONFIG.visibleAreaProgress) {
                    const fadeProgress = (progress - CONFIG.visibleAreaProgress) / CONFIG.fadeOutDuration;
                    this.animatedMaterial.opacity = CONFIG.initialOpacity * (1 - fadeProgress);
                } else {
                    this.animatedMaterial.opacity = CONFIG.initialOpacity;
                }

                // Somente remove quando 100% do tempo passou e opacidade chegou a 0
                if (progress >= 1 && this.animatedMaterial.opacity <= 0) {
                    this.isComplete = true;
                    scene.remove(this.mesh);
                    this.mesh.geometry.dispose();
                    this.animatedMaterial.dispose();
                }
            }
        }

        // Função para selecionar quadrados aleatórios e criar animações
        const createRandomAnimations = () => {
            const isMobile = window.innerWidth < 768;
            const numberOfCubes = isMobile ? CONFIG.cubesPerBatchMobile : CONFIG.cubesPerBatchDesktop;
            const availableSquares = [...staticSquaresRef.current];

            // Embaralhar array
            for (let i = availableSquares.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableSquares[i], availableSquares[j]] = [availableSquares[j], availableSquares[i]];
            }

            // Criar animações para os primeiros N quadrados
            for (let i = 0; i < Math.min(numberOfCubes, availableSquares.length); i++) {
                const square = availableSquares[i];
                const direction = square.userData.side === 'left' ? 1 : -1;
                animatingCubesRef.current.push(
                    new AnimatingCube(
                        square.userData.originalX,
                        square.userData.originalY,
                        direction,
                        square.userData.materialIndex,
                        square.userData.size
                    )
                );
            }
        };

        // Criar animações a cada intervalo
        let lastAnimationTime = Date.now();

        // Criar primeiro grupo imediatamente
        createRandomAnimations();

        // Adicionar raycaster para detectar hover
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredObject = null;

        // Função para lidar com movimento do mouse
        const onMouseMove = (event) => {
            // Calcular posição do mouse normalizada
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Atualizar raycaster
            raycaster.setFromCamera(mouse, camera);

            // Verificar interseções com todos os objetos
            const allObjects = [...staticSquaresRef.current, ...animatingCubesRef.current.map(cube => cube.mesh).filter(mesh => mesh)];
            const intersects = raycaster.intersectObjects(allObjects);

            // Se há um novo objeto sob o mouse
            if (intersects.length > 0) {
                const newHoveredObject = intersects[0].object;
                
                if (hoveredObject !== newHoveredObject) {
                    // Remover hover do objeto anterior
                    if (hoveredObject && hoveredObject.userData.originalMaterial) {
                        hoveredObject.material = hoveredObject.userData.originalMaterial;
                        delete hoveredObject.userData.isHovered;
                    }
                    
                    // Adicionar hover ao novo objeto
                    hoveredObject = newHoveredObject;
                    hoveredObject.userData.originalMaterial = hoveredObject.material;
                    hoveredObject.userData.isHovered = true;
                    
                    // Criar nova textura com hover
                    const angle = CONFIG.gradientAngles[hoveredObject.userData.materialIndex % CONFIG.gradientAngles.length];
                    const hoverTexture = createGradientTexture(angle, true);
                    const hoverMaterial = new THREE.MeshBasicMaterial({
                        map: hoverTexture,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: hoveredObject.material.opacity
                    });
                    hoveredObject.material = hoverMaterial;
                }
            } else {
                // Remover hover se não há interseção
                if (hoveredObject && hoveredObject.userData.originalMaterial) {
                    hoveredObject.material = hoveredObject.userData.originalMaterial;
                    delete hoveredObject.userData.isHovered;
                    hoveredObject = null;
                }
            }
        };

        // Adicionar listener de mouse
        window.addEventListener('mousemove', onMouseMove);

        // Função de animação
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            const currentTime = Date.now();

            // Verificar se é hora de criar novas animações
            if (currentTime - lastAnimationTime >= CONFIG.animationInterval) {
                createRandomAnimations();
                lastAnimationTime = currentTime;
            }

            // Atualizar todos os cubos animados
            for (let i = animatingCubesRef.current.length - 1; i >= 0; i--) {
                animatingCubesRef.current[i].update();

                // Remover cubos completos do array
                if (animatingCubesRef.current[i].isComplete) {
                    animatingCubesRef.current.splice(i, 1);
                }
            }

            renderer.render(scene, camera);
        };

        // Ajustar tamanho quando a janela mudar
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Recriar quadrados estáticos para nova proporção
            staticSquaresRef.current.forEach(square => {
                scene.remove(square);
                square.geometry.dispose();
            });
            staticSquaresRef.current = [];
            createStaticSquares();
        };

        window.addEventListener('resize', handleResize);

        // Iniciar animação
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationId);

            // Limpar todos os cubos animados
            animatingCubesRef.current.forEach(cube => {
                if (cube.mesh) {
                    scene.remove(cube.mesh);
                    cube.mesh.geometry.dispose();
                    cube.animatedMaterial.dispose();
                }
            });

            // Limpar quadrados estáticos
            staticSquaresRef.current.forEach(square => {
                scene.remove(square);
                square.geometry.dispose();
            });

            // Limpar materiais
            materialsRef.current.forEach(material => {
                if (material.map) material.map.dispose();
                material.dispose();
            });

            // Limpar renderer
            renderer.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} className="cube-animation-canvas" />;
};

export default CubeAnimation;