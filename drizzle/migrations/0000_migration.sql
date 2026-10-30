CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL,
  unit text NOT NULL DEFAULT '500g',
  description text NOT NULL DEFAULT '',
  cooking_tips text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  note text,
  payment_method text NOT NULL,
  total integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  price integer NOT NULL,
  quantity integer NOT NULL
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own items read" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "own items insert" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

INSERT INTO public.products (slug,name,category,price,unit,description,cooking_tips) VALUES
('bap-bo','Bắp bò','bo',185000,'500g','Bắp bò hoa giòn sần sật, gân đan xen.','Luộc, ngâm mắm, phở, bò kho.'),
('de-suon-bo','Dẻ sườn bò','bo',210000,'500g','Dẻ sườn mềm, nhiều vân mỡ, thơm ngậy.','Nướng BBQ, hầm, lẩu.'),
('than-bo','Thăn bò','bo',265000,'500g','Thăn nội mềm nhất con bò, ít mỡ.','Áp chảo steak, xào, bò tái.'),
('bo-xay','Bò xay','bo',145000,'500g','Thịt bò xay tươi mỗi sáng.','Burger, sốt bolognese, chả bò.'),
('ba-chi-bo-my','Ba chỉ bò Mỹ nhập khẩu','bo',175000,'500g','Ba chỉ bò Mỹ thái lát mỏng.','Nướng, lẩu, cuộn nấm kim châm.'),
('ba-chi-lon','Ba chỉ lợn','lon',95000,'500g','Ba chỉ 3 lớp nạc mỡ cân đối.','Kho tàu, nướng, luộc cuốn.'),
('suon-non','Sườn non','lon',125000,'500g','Sườn non sụn mềm.','Rim chua ngọt, nướng mật ong, canh.'),
('nac-vai','Nạc vai','lon',89000,'500g','Nạc vai mềm, có chút mỡ xen.','Xào, rang, thịt xiên nướng.'),
('chan-gio','Chân giò','lon',79000,'500g','Chân giò trước chắc thịt.','Luộc, bún bò, giả cầy.'),
('mo-lon','Mỡ lợn','lon',45000,'500g','Mỡ phần lưng trắng sạch.','Rán tóp mỡ, thắng mỡ nước.'),
('ga-nguyen-con','Gà ta nguyên con','ga',220000,'1 con ~1.5kg','Gà ta thả vườn, da vàng, thịt chắc.','Luộc, hấp lá chanh, cháo gà.'),
('dui-ga','Đùi gà','ga',75000,'500g','Đùi gà góc tư nhiều thịt.','Kho sả ớt, chiên nước mắm, nướng.'),
('uc-ga','Ức gà','ga',65000,'500g','Ức gà phi lê ít mỡ, giàu đạm.','Áp chảo, salad, gà xé phay.'),
('canh-ga','Cánh gà','ga',79000,'500g','Cánh gà khúc giữa.','Chiên mắm, nướng mật ong.'),
('long-ga','Lòng gà','ga',45000,'500g','Mề, tim, gan gà làm sạch.','Xào mướp, cháo lòng.'),
('gio-lua','Giò lụa','che-bien',110000,'500g','Giò lụa giã tay, bọc lá chuối.','Ăn kèm bánh cuốn, bún, xôi.'),
('gio-thu','Giò thủ','che-bien',120000,'500g','Giò thủ tai mũi giòn, mộc nhĩ.','Ăn kèm dưa chua, ngày Tết.'),
('xuc-xich','Xúc xích Đức','che-bien',95000,'500g','Xúc xích xông khói kiểu Đức.','Nướng, chiên, BBQ.'),
('thit-nguoi','Thịt nguội','che-bien',105000,'300g','Thịt nguội ham lát mỏng.','Bánh mì, sandwich.'),
('lap-xuong','Lạp xưởng','che-bien',135000,'500g','Lạp xưởng tươi tỷ lệ nạc cao.','Chiên, hấp, cơm chiên.'),
('cha-la-lot','Chả lá lốt','che-bien',85000,'500g','Chả lá lốt cuốn sẵn, chỉ cần rán.','Rán, ăn với bún mắm nêm.');