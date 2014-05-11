INSERT INTO poll_items (p_i_name) VALUES ('Choice #1'),('Choice #2'),('Choice #3'),('Choice #4');
INSERT INTO polls SET p_title='Test Poll',p_maxvotes=3,p_subonly='',p_open='';
INSERT INTO choices (_p_id,_p_i_id,c_bit) SELECT MAX(p_id),MAX(p_i_id),0 FROM polls,poll_items;
INSERT INTO choices (_p_id,_p_i_id,c_bit) SELECT MAX(p_id),MAX(p_i_id)-1,1 FROM polls,poll_items;
INSERT INTO choices (_p_id,_p_i_id,c_bit) SELECT MAX(p_id),MAX(p_i_id)-2,2 FROM polls,poll_items;
INSERT INTO choices (_p_id,_p_i_id,c_bit) SELECT MAX(p_id),MAX(p_i_id)-3,3 FROM polls,poll_items;
