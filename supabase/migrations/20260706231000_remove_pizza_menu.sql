delete from menu_item_images
where menu_item_id in (
  select mi.id
  from menu_items mi
  join categories c on c.id = mi.category_id
  where c.slug = 'pizza' or lower(c.name) = 'pizza'
);

delete from menu_items
where category_id in (
    select id from categories where slug = 'pizza' or lower(name) = 'pizza'
  )
   or lower(name) like '%pizza%'
   or lower(name) in (
    'margherita classico',
    'robot signature pepperoni',
    'wild mushroom bianca'
   );

delete from categories
where slug = 'pizza'
   or lower(name) = 'pizza';
