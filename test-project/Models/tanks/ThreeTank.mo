within Tanks.Examples;

model ThreeTank
  extends Modelica.Icons.Example;
  WaterTanks1 waterTanks11 annotation(Placement(visible = true, transformation(origin = {-58, 1.77636e-15}, extent = {{-30, -30}, {30, 30}}, rotation = 0)));
  WaterTanks2 waterTanks21 annotation(Placement(visible = true, transformation(origin = {39, -1}, extent = {{-31, -31}, {31, 31}}, rotation = 0)));
  WaterTankController waterTankController1 annotation(Placement(visible = true, transformation(origin = {-12, 66}, extent = {{-28, -28}, {28, 28}}, rotation = 0)));
equation
  connect(waterTanks21.level, waterTankController1.wt3_level) annotation(Line(points = {{72, 23}, {80, 23}, {80, 80}, {-52, 80}, {-52, 65}, {-39, 65}}, color = {0, 0, 127}));
  connect(waterTankController1.wt3_valve, waterTanks21.valveControl) annotation(Line(points = {{18, 66}, {39, 66}, {39, 30}}, color = {0, 0, 127}));
  connect(waterTanks11.Tank2OutFlow, waterTanks21.inFlow) annotation(Line(points = {{-25, -16}, {-8, -16}, {-8, 24}, {4, 24}, {4, 24}}, color = {0, 0, 127}));
  annotation(Icon(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2})), Diagram(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2})));
end ThreeTank;