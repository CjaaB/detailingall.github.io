document.addEventListener('DOMContentLoaded', () => {
    const sizeSelect = document.getElementById('car-size');
    const services = document.querySelectorAll('.service');

    // Pobranie ID elementów do logiki wykluczeń
    const extBasic = document.getElementById('ext-basic');
    const intBasic = document.getElementById('int-basic');
    const fullCombo = document.getElementById('full-combo');
    const deepClean = document.getElementById('deep-clean');
    const showroom = document.getElementById('showroom');
    const leatherClean = document.getElementById('leather-clean');
    const bonetingSeats = document.getElementById('boneting-seats');
    const bonetingFull = document.getElementById('boneting-full');

    /**
     * Główna logika wykluczeń - pilnuje, aby klient nie wybrał sprzecznych opcji
     */
    function handleExclusions(e) {
        const target = e.target;

        // 1. Logika SHOWROOM READY (Zawiera wszystko, więc czyści resztę)
        if (target === showroom && showroom.checked) {
            extBasic.checked = false;
            intBasic.checked = false;
            fullCombo.checked = false;
            deepClean.checked = false;
            leatherClean.checked = false;
            bonetingSeats.checked = false;
            bonetingFull.checked = false;
        }

        // 2. Logika SKÓRA vs MATERIAŁ (Najważniejsza uwaga!)
        // Jeśli wybierasz czyszczenie skór, nie możesz wybrać prania ani bonetowania materiału
        if (target === leatherClean && leatherClean.checked) {
            deepClean.checked = false;
            bonetingSeats.checked = false;
            bonetingFull.checked = false;
            showroom.checked = false; // Showroom też odznaczamy, bo ma pranie w pakiecie
        }

        // Jeśli wybierasz dowolną formę czyszczenia materiału, odznacz skóry
        if ((target === deepClean || target === bonetingSeats || target === bonetingFull) && target.checked) {
            leatherClean.checked = false;
        }

        // 3. Logika PRANIA (Deep Clean to najwyższy standard materiału)
        if (target === deepClean && deepClean.checked) {
            intBasic.checked = false;
            fullCombo.checked = false;
            showroom.checked = false;
            bonetingSeats.checked = false;
            bonetingFull.checked = false;
        }

        // 4. Logika BONETOWANIA (Full wyklucza mniejsze bonetowanie)
        if (target === bonetingFull && bonetingFull.checked) {
            bonetingSeats.checked = false;
            deepClean.checked = false; // Bonetowanie to alternatywa dla prania
            showroom.checked = false;
        }
        if (target === bonetingSeats && bonetingSeats.checked) {
            bonetingFull.checked = false;
            deepClean.checked = false;
        }

        // 5. Logika PAKIETÓW ZBIORCZYCH
        if (target === fullCombo && fullCombo.checked) {
            extBasic.checked = false;
            intBasic.checked = false;
            deepClean.checked = false;
            showroom.checked = false;
        }

        // Jeśli zaznaczysz opcje podstawowe, wyłącz pakiety, które je zawierają
        if ((target === extBasic || target === intBasic) && target.checked) {
            fullCombo.checked = false;
            showroom.checked = false;
        }
    }

    /**
     * Funkcja obliczająca sumę netto, VAT i brutto
     */
    function calculate() {
        const currentSize = sizeSelect.value;
        let totalNet = 0;

        services.forEach(checkbox => {
            if (checkbox.checked) {
                // Cena zależna od rozmiaru (data-s, m, l, xl)
                const sizePrice = checkbox.getAttribute(`data-${currentSize.toLowerCase()}`);
                // Cena stała dla dodatków (data-static)
                const staticPrice = checkbox.getAttribute('data-static');

                if (sizePrice) {
                    totalNet += parseFloat(sizePrice);
                } else if (staticPrice) {
                    totalNet += parseFloat(staticPrice);
                }
            }
        });

        // Konfiguracja stawek i obliczenia (VAT 21%)
        const vatRate = 0.21;
        const vatAmount = totalNet * vatRate;
        const totalGross = totalNet + vatAmount;

        // Formatowanie waluty (Europejski standard: 1.234,56 €)
        const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        
        document.getElementById('res-net').innerText = totalNet.toLocaleString('de-DE', formatOptions);
        document.getElementById('res-vat').innerText = vatAmount.toLocaleString('de-DE', formatOptions);
        document.getElementById('res-gross').innerText = totalGross.toLocaleString('de-DE', formatOptions);
    }

    // --- EVENT LISTENERS ---

    // Przelicz, gdy zmieni się rozmiar auta
    sizeSelect.addEventListener('change', calculate);

    // Przelicz i sprawdź wykluczenia, gdy zmieni się usługa
    services.forEach(s => {
        s.addEventListener('change', (e) => {
            handleExclusions(e); 
            calculate();        
        });
    });

    // Uruchomienie przy starcie strony (reset do 0,00 €)
    calculate();
});