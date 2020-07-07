0.5::node(cloud, 50, [camera, bike], [encrypted_storage, anti_tampering]);0.2::node(cloud, 1, [], []).
node(isp, 1, [bike, camera], [encrypted_storage, anti_tampering]).
0.5::link(cloud, isp, 8, 16);0.5::link(cloud, isp, 16, 9).
link(isp, cloud, 12, 12).