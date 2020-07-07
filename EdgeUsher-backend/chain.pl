chain(catena_prova, [iot_controller, processing]).
% Services
service(iot_controller, 5, 2, [camera, bike], or(anti_tampering, encrypted_storage)).
service(processing, 10, 2, [], []).
% Links
flow(iot_controller, processing, 8).