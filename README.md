==============================================================================
 CALCULADORA DE CINTAS TRANSPORTADORAS - INSTRUCCIONES DE USO
 Transporte y Manutención Industrial - Escuela técnica superior de Béjar

 Aplicación WEB desarrollada por Carlos Zamora y Rafael Padilla
==============================================================================


- Campos automáticos (importante)
    Cuatro campos vienen ya rellenos con el valor de tabla de los apuntes y
    se recalculan solos al cambiar L, H o B:
        - Rodillo central l3      (Figura 6)
        - Factor de longitud CL   (tabla de CL)
        - Peso de banda qB        (estimación 0,0145 · B)
        - k de pendiente          (Tabla 2)
    Si escribes tu propio valor (por ejemplo el del catálogo del fabricante o
    el que da el enunciado), la calculadora respeta tu dato. Para volver al
    valor de tabla, BORRA el campo.

- Ayudas en pantalla
    - Las miniaturas con lupa (Figura 2, Figura 5, Figura 6) se amplían al
      pinchar y explican la figura con tus datos.
    - Los botones "Ver tabla de CL", "Ver tabla de k" y "Cómo obtener qB"
      abren la tabla con tu valor resaltado.
    - En granulometría hay un desplegable con la tabla de factores.

- Orden de trabajo recomendado
    1) Material, caudal y tamaño de bulto  ->  2) anchura mínima de banda y
    velocidad máxima  ->  3) geometría  ->  4) comprobar que Q <= Qmáx
    (si no, subir B y/o v)  ->  5) potencia y tensiones  ->  6) banda y tambores.
    La anchura B y la velocidad v se ajustan por tanteo (ver el ejemplo 1 al
    final): se busca la cinta más estrecha y rápida que cumpla [4.1, 1.1.1].

------------------------------------------------------------------------------
 1. PESTAÑA "1. MATERIAL Y CAUDAL"
------------------------------------------------------------------------------

Material
    Lista desplegable con las tablas Rulmeca (Al elegir un
    material, la densidad se rellena con la media del rango de la tabla (por
    ejemplo, "Caliza fragmentada": 1,36-1,44 -> 1,40 t/m3). 
	-Puedes consultar
  		  todas las propiedades (reposo, abrasividad, fluidez...) en la pestaña
 		   "Cálculos material y caudal" -> "Biblioteca de propiedades de materiales".

Caudal másico Q (t/h)
    El caudal que la cinta debe transportar. 
     
Densidad aparente (t/m3)
    Si cambias el material, se actualiza. Se puede editar si los datos de la tabla distan con la realidad. Ojo con las unidades.

Tamaño máximo de bulto (mm)
    Dimensión del fragmento mayor. Sirve para comprobar que la banda es lo
    bastante ancha. Si no queremos que lo compruebe introducimos: 0 

Granulometría (% de gruesos)
    - Uniforme: todos los bultos son de tamaño parecido.
    - 10 %: mezcla en la que, como mucho, una décima parte son bultos grandes
      ("gruesos") y el resto es material fino (90 %).
    - 100 %: todo el material son bultos grandes.
    El desplegable muestra el factor por el que se multiplica el tamaño máximo
    para obtener la anchura mínima de banda [4.1, Tabla de granulometría]:
                             10 % gruesos / 90 % finos      100 % gruesos
        talud  < 20 grados             3                          5
        20 a 30 grados                 6                         10
   
Clase de material (A, B, C, D)
    Sirve para leer la velocidad máxima:
        A: ligeros y deslizables, no abrasivos (0,5-1 t/m3)
        B: no abrasivos o muy poco abrasivos, tamaño medio (1-1,5 t/m3)
        C: medianamente abrasivos y pesados (1,5-2 t/m3)
        D: muy abrasivos, pesados y cortantes (> 2 t/m3)
    "Auto" la elige solo a partir de la densidad. (consulta la columna "Abrasividad" de la biblioteca). 

	-Pincha la miniatura de la figura para ver la tabla completa.

------------------------------------------------------------------------------
 2. PESTAÑA "2. GEOMETRÍA"
------------------------------------------------------------------------------

Longitud entre centros L (m) y Desnivel H (m)
    Datos de la instalación. La calculadora obtiene la inclinación como
    delta = arctan(H / L) y de ella el factor k de la Tabla 2 [4.1].
      Ejemplo 1: L = 805 m, H = 150 m -> delta = 10,56 grados.
      Ejemplo 3: L = 100 m, H = 0 (cinta horizontal; es válido poner 0).
    Nota: [4.1] da 10,73 grados porque calcula arcsen(H/L). La diferencia en k
    es despreciable (0,944 frente a 0,943).

Ancho de banda B (mm)
    Anchuras normalizadas: 300, 400, 500, 650, 800, 1000, 1200, 1400, 1600.
    Empieza por la mínima que exigen la granulometría y la Figura 2 y sube
    hasta que la capacidad Q <= Qmáx [4.1, 1.1.1 y ejemplo 1]. Procura que la
    cinta sea lo más estrecha posible: reduce el coste de la instalación.
    La tarjeta "Verificación de capacidad" te avisa si B no cumple el tamaño
    de bulto o la velocidad.

Ángulo de artesa lambda (grados): 20, 30, 35 o 45
    Inclinación de los rodillos laterales de la estación. Dato del enunciado.
      Ejemplo 1: 35 grados.   Ejemplo 3: 30 grados.

Rodillos de la estación portante: 1, 2 o 3
    1 = plano (lambda se anula), 2 = en V (l3 = 0), 3 = en artesa.
      Ejemplo 3: 3 rodillos.

Talud dinámico theta (grados)
    También llamado ángulo de sobrecarga. Es el ángulo que forma el material
    sobre la banda en movimiento (no es el ángulo de reposo: es menor).
    Si el enunciado lo da, úsalo (Ejemplos 1 y 3: 15 grados). Si no, [4.1,
    Figura 7] lo da según la fluidez del material:
        Muy buena: 5 grados   Buena: 10   Normal: 20-25   Mala: 30
    Para theta <= 20 la tabla de granulometría usa la primera fila; para
    20 < theta <= 30, la segunda.

Sección S: fórmula o tabla
    - Fórmula: S = S1 + S2 con las expresiones de la Figura 5 [4.1]
      (b = 0,9 B - 0,05 m). Sirve para cualquier talud y 1, 2 o 3 rodillos.
      Es la que se usa en los Ejemplos 2 y 3.
    - Tabla: valor tabulado para theta = 15 grados y 3 rodillos [4.1, método 2
      y tabla Rulmeca]. Es lo que se hace en el Ejemplo 1 (caudal volumétrico
      de tabla). Para B = 300 y 400 mm el valor es estimado.
    Las dos opciones difieren (la fórmula da entre un 8 y un 18 % menos de sección que la tabla); no es un error, son dos métodos. Usa el necesario. 
	- Pincha la miniatura "Figura 5 y tabla de secciones" para ver ambas opciones (se resalta la opción elegida).

Rodillo central l3 (mm)
    Longitud del rodillo central en estaciones de 3 rodillos. (por ejemplo, 400 mm -> 160 mm; 1000 mm -> 380 mm).
    Ya aparece relleno; solo edítalo si necesitas otro valor.

------------------------------------------------------------------------------
 3. PESTAÑA "3. BANDA Y ACCIONAMIENTO"
------------------------------------------------------------------------------

Velocidad v (m/s)
    Debe ser un valor normalizado (DIN 22101, [4.1]):
        0,66  0,84  1,05  1,31  1,68  2,09  2,62  3,35  4,19  5,24
    y no superar la velocidad máxima de la Figura 2 para tu B y tu clase.
    Se elige la mayor posible (reduce B y el coste), salvo materiales
    pulverulentos, abrasivos, friables o muy grandes, que piden velocidades
    bajas.
    Si queremos modificar el caudal, se despeja:
        v = Q / (3600 · S · densidad · k)  ->  1,52 m/s
    y se toma el valor normalizado superior (1,68 m/s), comprobando que no
    supera la máxima. La calculadora avisa (aviso naranja) si no es normalizada.

Ángulo de abrace phi (grados)
    Ángulo con que la banda envuelve el tambor motriz. A más abrace, más
    fuerza se transmite sin deslizar [2, tambor accionador; 5.2].
      Ejemplo 3: 210 grados.   Ejercicio 4 de [6]: 160 grados.

Coeficiente de rozamiento tambor-banda mu
    De la tabla de [5.1] (coeficientes de transmisión):
                                   acero     goma     poliuretano  cerámica
                                   desnudo   60 Shore
        Funcionamiento en seco     0,35-0,40 0,40-0,45  0,35-0,40  0,40-0,45
        Mojado con agua limpia     0,10      0,35       0,35       0,35-0,40
        Mojado con agua sucia      0,05-0,10 0,25-0,30  0,20       0,35
    Por defecto 0,35 (tambor de acero, en seco). Para que no deslice debe
    cumplirse T1/T2 < e^(mu·phi); la calculadora usa la igualdad para
    calcular las tensiones. mu = 0,2.
    
Factor de fricción de rodillos f
    Resistencia de giro de los rodillos y rodadura de la banda. Varía
    con las condiciones de la cinta; los apuntes usan 0,02.
    Los fabricantes (Rulmeca) dan tablas con más factores correctores.

Rendimiento del grupo motriz eta
    Rendimiento del motor-reductor. Por defecto 0,88.

Resistencia nominal por capa Rl (N/mm)
    Resistencia de cada capa de una banda textil (dato del fabricante, banda
    EP de [2]).

------------------------------------------------------------------------------
 4. PESTAÑA "4. RODILLOS Y FACTORES"
------------------------------------------------------------------------------

Masa de la estación portante (kg) y Paso de los rodillos portantes (m)
    Masa de los rodillos de una estación del ramal superior y distancia entre
    estaciones. Con ellos se obtiene qRO = masa / paso (kg/m) [4.3].
    La masa sale del catálogo del fabricante de rodillos; la tabla "peso de
    las partes móviles" da el orden de magnitud (botón "Cómo obtener qB").
    El paso es de 1 a 1,5 m en el tramo de carga [2, rodillos]. 

Masa de la estación de retorno (kg) y Paso de retorno (m)
    Igual para el ramal inferior, con paso doble o triple que el de carga
    [2].

Factor de longitud CL
    Las bandas cortas necesitan proporcionalmente más esfuerzo que las largas;
    se corrige con Lc = CL · L [4.1, tabla "Factor de corrección de la
    longitud"]. Se rellena solo (3 m -> 9 ... 100 m -> 1,7 ... 500 m o más
    -> 1,05). Botón "Ver tabla de CL".

Peso de banda qB (kg/m)
    Lo ideal es el dato del catálogo de la banda elegida (Ejemplo 3: 3,8 kg/m
    para B = 400 mm). Si no se conoce, la calculadora estima 0,0145 - B
    (14,5 kg/m para 1000 mm). Es una estimación: sustitúyela cuando tengas el dato real.

k de pendiente
    Factor de reducción de la capacidad por inclinación. Se
    interpola solo. Botón "Ver tabla de k".

------------------------------------------------------------------------------
 5. CÓMO LEER LOS RESULTADOS
------------------------------------------------------------------------------

Verificación de capacidad (pestaña 2)
    Qmáx = 3600 · v · S · densidad · k  y  utilización = Q / Qmáx.
    VERIFICADO si <= 100 %; SOBRECARGA si no (entonces sube B o v).
    Debajo salen las comprobaciones:
        OK verde      cumple      X rojo   no cumple
        aviso naranja revisar     i gris   información
    (tamaño de bulto frente a B, criterio de granulometría, velocidad máxima,
    velocidad normalizada, L <= 80 m, theta distinto de 15 grados...).

Cargas lineales
    qG = Q / (3,6 · v) (material), qB (banda), qRO y qRU (rodillos) [4.3].

Esfuerzos y resistencias
    FH (rodadura, principal), FN = (CL - 1) · FH (secundarias), FSt = qG · H · g
    (desnivel) y Fu = FH + FN + FSt, el esfuerzo tangencial en el tambor.
    La expresión simplificada solo es válida para L > 80 m.

Potencia
    PA = Fu · v (en el eje del tambor) y Pm = PA / eta (motor), 

Tensiones (Euler-Eytelwein) [5.2]
    T2 = Fu / (e^(mu·phi) - 1) (ramal flojo) y T1 = Fu + T2 (ramal tenso).
    En esta página T1 es el tensor; 

Selección de componentes
    - T1/B: tensión por mm de ancho. Banda de cable de acero sugerida con
      coeficiente de seguridad 8 y diámetros de tambor orientativos
      (complemento; no son datos de los apuntes).
    - Banda textil: z = S · T1 / (B · Rl), con S = 11 (3-5 capas), 12 (6-9) o
      13 (más de 9)
    - Separación máxima de rodillos: l0 <= 0,08 · T / ((qB + qG) · g) en el
      ramal superior y lu <= 0,08 · T / (qB · g) en el inferior (flecha
      máxima del 1 %).

Pestañas "Cálculos ..."
    Cada resultado con su fórmula y los números sustituidos.

Botón "Imprimir cálculos (PDF)"
    Genera la memoria de cálculo. En un navegador normal se abre el cuadro de
    impresión: elige "Guardar como PDF".


