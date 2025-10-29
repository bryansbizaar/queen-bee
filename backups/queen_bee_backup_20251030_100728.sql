--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
DROP INDEX IF EXISTS public.idx_products_featured;
DROP INDEX IF EXISTS public.idx_products_display_order;
DROP INDEX IF EXISTS public.idx_products_display;
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_products_active;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_payment_intent;
DROP INDEX IF EXISTS public.idx_orders_customer;
DROP INDEX IF EXISTS public.idx_order_items_order;
DROP INDEX IF EXISTS public.idx_customers_email;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_payment_intent_id_key;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_order_id_key;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_pkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_email_key;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.customers ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.customers_id_seq;
DROP TABLE IF EXISTS public.customers;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    phone character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    product_title character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_price integer NOT NULL,
    total_price integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_id character varying(100) NOT NULL,
    customer_id integer,
    customer_email character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    total_amount integer NOT NULL,
    currency character varying(3) DEFAULT 'NZD'::character varying,
    payment_intent_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    price integer NOT NULL,
    image character varying(255),
    category character varying(100) DEFAULT 'candles'::character varying,
    stock_quantity integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    weight_kg numeric(10,3),
    length_mm integer,
    width_mm integer,
    height_mm integer,
    is_featured boolean DEFAULT false,
    display_order integer DEFAULT 100
);


--
-- Name: COLUMN products.weight_kg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.weight_kg IS 'Product weight in kilograms (e.g., 0.150 = 150g) - CANDLE ONLY, packaging added by system';


--
-- Name: COLUMN products.length_mm; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.length_mm IS 'Longest horizontal dimension in millimeters - CANDLE ONLY';


--
-- Name: COLUMN products.width_mm; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.width_mm IS 'Shortest horizontal dimension in millimeters - CANDLE ONLY';


--
-- Name: COLUMN products.height_mm; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.height_mm IS 'Vertical dimension in millimeters - CANDLE ONLY';


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, email, first_name, last_name, phone, created_at, updated_at) FROM stdin;
1	bryansbizaar@yahoo.com	ljsdf lkasdjf	\N	\N	2025-10-29 08:46:01.679783	2025-10-29 08:46:01.679783
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, product_title, quantity, unit_price, total_price, created_at) FROM stdin;
1	1	5	Flower	1	800	800	2025-10-29 08:46:01.679783
2	2	6	Swirl	1	1500	1500	2025-10-29 08:50:47.241927
3	3	8	Beehive Skep (med)	1	1000	1000	2025-10-29 09:15:34.226629
4	4	9	Bear and Skep	1	900	900	2025-10-29 09:20:14.020882
5	5	10	Woodland Bear	1	900	900	2025-10-29 12:25:39.97914
6	6	11	Honey Pot	1	1300	1300	2025-10-29 12:46:22.090458
7	7	12	Old Man Winter	1	1100	1100	2025-10-29 12:53:44.515746
8	8	5	Flower	1	800	800	2025-10-30 08:47:55.54505
9	9	5	Flower	1	800	800	2025-10-30 08:56:05.903595
10	10	6	Swirl	1	1500	1500	2025-10-30 08:58:05.57441
11	11	5	Flower	1	800	800	2025-10-30 09:27:27.845067
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_id, customer_id, customer_email, status, total_amount, currency, payment_intent_id, created_at, updated_at) FROM stdin;
1	QBC-1761680761700-p9ic6uini	1	bryansbizaar@yahoo.com	paid	160000	NZD	pi_3SNIpuF9MElxuMjv05eXr5oG	2025-10-29 08:46:01.679783	2025-10-29 08:46:01.679783
2	QBC-1761681047251-mml2r94om	1	bryansbizaar@yahoo.com	paid	230000	NZD	pi_3SNIuSF9MElxuMjv0vz7CFZi	2025-10-29 08:50:47.241927	2025-10-29 08:50:47.241927
3	QBC-1761682534244-jup6prola	1	bryansbizaar@yahoo.com	paid	180000	NZD	pi_3SNJIbF9MElxuMjv0riLUOyf	2025-10-29 09:15:34.226629	2025-10-29 09:15:34.226629
4	QBC-1761682814026-jbrknncw5	1	bryansbizaar@yahoo.com	paid	170000	NZD	pi_3SNJN6F9MElxuMjv1N5sUnpY	2025-10-29 09:20:14.020882	2025-10-29 09:20:14.020882
5	QBC-1761693939992-qzt418nze	1	bryansbizaar@yahoo.com	paid	170000	NZD	pi_3SNMGYF9MElxuMjv1yHX9pp1	2025-10-29 12:25:39.97914	2025-10-29 12:25:39.97914
6	QBC-1761695182104-ug0z59jdd	1	bryansbizaar@yahoo.com	paid	2100	NZD	pi_3SNMaaF9MElxuMjv1QaLYsKx	2025-10-29 12:46:22.090458	2025-10-29 12:46:22.090458
7	QBC-1761695624528-3660z60k5	1	bryansbizaar@yahoo.com	paid	1900	NZD	pi_3SNMhZF9MElxuMjv2rRd6v2V	2025-10-29 12:53:44.515746	2025-10-29 12:53:44.515746
8	QBC-1761767275564-0g07mku1j	1	bryansbizaar@yahoo.com	paid	1600	NZD	pi_3SNfLQF9MElxuMjv1Si9NiuE	2025-10-30 08:47:55.54505	2025-10-30 08:47:55.54505
9	QBC-1761767765928-hado1e35d	1	bryansbizaar@yahoo.com	paid	1600	NZD	pi_3SNfTJF9MElxuMjv2i0D9hCk	2025-10-30 08:56:05.903595	2025-10-30 08:56:05.903595
10	QBC-1761767885582-1h0zkoybu	1	bryansbizaar@yahoo.com	paid	2300	NZD	pi_3SNfVFF9MElxuMjv16UB3OON	2025-10-30 08:58:05.57441	2025-10-30 08:58:05.57441
11	QBC-1761769647934-q781ru1do	1	bryansbizaar@yahoo.com	paid	1600	NZD	pi_3SNfxgF9MElxuMjv0VbNizQF	2025-10-30 09:27:27.845067	2025-10-30 09:27:27.845067
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, title, description, price, image, category, stock_quantity, is_active, created_at, updated_at, weight_kg, length_mm, width_mm, height_mm, is_featured, display_order) FROM stdin;
1	Dragon	150g 11.5H x 8W	1500	dragon.jpg	candles	15	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	t	1
2	Corn Cob	160g 15.5H x 4.5W	1600	corn-cob.jpg	candles	12	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	t	2
3	Bee and Flower	45g 3H X 6.5W	850	bee-and-flower.jpg	candles	18	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	t	3
4	Rose	40g 3H X 6.5W	800	rose.jpg	candles	20	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	t	4
12	Old Man Winter	95g 7H x 5W	1100	old-man-winter.jpg	candles	9	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	12
7	Fern Ball	280g 8H x 9W	2000	fern-ball.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	t	7
6	Swirl	160g 6.5H x 7.5W	1500	swirl.jpg	candles	8	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	t	6
5	Flower	40g 3H x 6.5W	800	flower.jpg	candles	6	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	t	5
13	Beehive Skep (sm)	30g 4H x 3.5W	700	skep-sm.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	13
14	Pinecone (sm)	25g 4H x 3.5W	600	pinecone-sm.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	14
15	Pinecone (lg)	65g 8.5H x 4W	900	pinecone-lg.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	15
16	Snowman	35g 6H x 4W	800	snowman.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	16
17	Morel Mushroom	80g 11H x 4.5W each	1000	morel.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	17
18	Flowers (set of 4)	80g (4x 20g) 2H x 4W	1000	four-flowers.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	18
19	Beehive Skep (lg)	245g 8H x 7.5W	1700	skep-lg.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	19
20	Tree (sm)	40g 8H x 4W	800	tree-sm.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	20
21	Tree (lg)	200g 14H x 7W	1600	tree-lg.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	21
22	Turkey	100g 9H x 8W	1200	turkey.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	22
23	Frog	120g 6H x 6W	1300	tree-sm.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	23
24	Hedgehog	60g 5.5H x 5W	800	hedgehog.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	24
25	Racoon	45g 5.5H x 4W	800	racoon.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	25
26	Moose	40g 5H x 4W	800	moose.jpg	candles	10	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	26
8	Beehive Skep (med)	90g 6.5H x 6W	1000	skep-lg.jpg	candles	9	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	t	8
9	Bear and Skep	50g 6H x 5W	900	bear-and-skep.jpg	candles	9	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	t	9
10	Woodland Bear	50g 5.5H x 4.5W	900	bear-lg.jpg	candles	9	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	t	10
11	Honey Pot	135g 5H x 7W	1300	honey-pot.jpg	candles	9	t	2025-10-28 10:41:52.997761	2025-10-28 10:41:52.997761	\N	\N	\N	\N	f	11
\.


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 11, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 11, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 26, true);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_id_key UNIQUE (order_id);


--
-- Name: orders orders_payment_intent_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_intent_id_key UNIQUE (payment_intent_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- Name: idx_orders_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);


--
-- Name: idx_orders_payment_intent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_payment_intent ON public.orders USING btree (payment_intent_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_products_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_active ON public.products USING btree (is_active);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category);


--
-- Name: idx_products_display; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_display ON public.products USING btree (is_featured DESC, display_order);


--
-- Name: idx_products_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_display_order ON public.products USING btree (display_order);


--
-- Name: idx_products_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_featured ON public.products USING btree (is_featured);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- PostgreSQL database dump complete
--

