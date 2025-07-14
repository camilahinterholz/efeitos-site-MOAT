import React, { useEffect, useRef } from 'react';
import '../style/botaoAnimado.css';

export default function GlowSections() {
    const buttonRefs = useRef([]);

    useEffect(() => {
        buttonRefs.current.forEach((btn) => {
            if (!btn) return;

            // Criar múltiplas camadas de glow para efeito mais intenso
            const glowContainer = document.createElement("div");
            glowContainer.classList.add("glow-container");

            // Glow principal (segue o mouse)
            const glowMain = document.createElement("span");
            glowMain.classList.add("glow-main");

            //Glow estático na borda direita
            const glowEdge = document.createElement("span");
            glowEdge.classList.add("glow-edge");

            // Reflexo de luz intensa
            const glowIntense = document.createElement("span");
            glowIntense.classList.add("glow-intense");

            glowContainer.appendChild(glowMain);
            glowContainer.appendChild(glowEdge);
            glowContainer.appendChild(glowIntense);
            btn.appendChild(glowContainer);

            const setInitialPosition = () => {
                const rect = btn.getBoundingClientRect();
                const x = rect.width - 20;
                const y = rect.height / 2;

                glowMain.style.left = `${x}px`;
                glowMain.style.top = `${y}px`;
                glowMain.style.transform = "translate(-50%, -50%)";

                glowIntense.style.left = `${x}px`;
                glowIntense.style.top = `${y}px`;
                glowIntense.style.transform = "translate(-50%, -50%)";

                glowEdge.style.left = `${x}px`;
                glowEdge.style.top = `${y}px`;
                glowEdge.style.transform = "translate(-50%, -50%)";

            };


            setInitialPosition();

            btn.addEventListener("mouseenter", () => {
                glowMain.style.transition = "none";
                btn.classList.add("hover");
            });

            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                glowMain.style.left = `${x}px`;
                glowMain.style.top = `${y}px`;
                glowMain.style.transform = "translate(-50%, -50%)";

                glowIntense.style.left = `${x}px`;
                glowIntense.style.top = `${y}px`;
                glowIntense.style.transform = "translate(-50%, -50%)";

                glowEdge.style.left = `${x}px`;
                glowEdge.style.top = `${y}px`;
                glowEdge.style.transform = "translate(-50%, -50%) scale(1.2)";


            });



            btn.addEventListener("mouseleave", () => {
                btn.classList.remove("hover");
                setInitialPosition();
            });
        });

        return () => {
            // Cleanup
            buttonRefs.current.forEach((btn) => {
                if (btn) {
                    btn.removeEventListener("mouseenter", () => { });
                    btn.removeEventListener("mousemove", () => { });
                    btn.removeEventListener("mouseleave", () => { });
                }
            });
        };
    }, []);

    return (
        <>
            <section className="section bg-escuro">
                <button
                    ref={el => buttonRefs.current[0] = el}
                    className="botao-com-glow"
                >
                    <span className="btn-text">Experimente Grátis →</span>
                </button>
            </section>

            <section className="section bg-claro">
                <button
                    ref={el => buttonRefs.current[1] = el}
                    className="botao-com-glow "
                >
                    <span className="btn-text">Experimente Grátis →</span>
                </button>
            </section>
        </>
    );
}