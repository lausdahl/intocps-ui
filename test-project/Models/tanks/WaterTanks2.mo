within Tanks.Examples;

model WaterTanks2
  Components.Tank tank3 annotation(Placement(visible = true, transformation(origin = {-50, 30}, extent = {{-20, -20}, {20, 20}}, rotation = 0)));
  Modelica.Blocks.Interfaces.RealInput valveControl annotation(Placement(visible = true, transformation(origin = {0, 100}, extent = {{-20, -20}, {20, 20}}, rotation = -90)));
  Modelica.Blocks.Interfaces.RealOutput level annotation(Placement(visible = true, transformation(origin = {106, 76}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  Modelica.Blocks.Interfaces.RealOutput Tank3OutFlow annotation(Placement(visible = true, transformation(origin = {106, -40}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  Components.Valve valve1 annotation(Placement(visible = true, transformation(origin = {14, 10}, extent = {{-14, -14}, {14, 14}}, rotation = 0)));
  Modelica.Blocks.Interfaces.RealInput inFlow annotation(Placement(visible = true, transformation(origin = {-100, 78}, extent = {{-20, -20}, {20, 20}}, rotation = 0)));
  Interfaces.Real2Fluid real2Fluid1 annotation(Placement(visible = true, transformation(origin = {-58, 78}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  Interfaces.Fluid2Real fluid2Real1 annotation(Placement(visible = true, transformation(origin = {62, -26}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
equation
  connect(valveControl, valve1.valveControl) annotation(Line(points = {{0, 100}, {0, 100}, {0, 50}, {14, 50}, {14, 22}, {14, 22}}, color = {0, 0, 127}));
  connect(fluid2Real1.y, Tank3OutFlow) annotation(Line(points = {{72, -26}, {86, -26}, {86, -40}, {98, -40}, {98, -40}}, color = {0, 0, 127}));
  connect(valve1.port_b, fluid2Real1.port_a) annotation(Line(points = {{28, 10}, {40, 10}, {40, -26}, {52, -26}, {52, -26}}, color = {0, 127, 255}));
  connect(real2Fluid1.port_b, tank3.port_a) annotation(Line(points = {{-48, 78}, {-38, 78}, {-38, 58}, {-50, 58}, {-50, 50}, {-50, 50}}, color = {0, 127, 255}));
  connect(inFlow, real2Fluid1.u) annotation(Line(points = {{-100, 78}, {-68, 78}, {-68, 78}, {-68, 78}}, color = {0, 0, 127}));
  connect(tank3.port_b, valve1.port_a) annotation(Line(points = {{-50, 10}, {0, 10}}, color = {0, 127, 255}));
  connect(tank3.level, level) annotation(Line(points = {{-28, 30}, {106, 30}, {106, 76}}, color = {0, 0, 127}));
  connect(tank3.port_b, valve1.port_a) annotation(Line(points = {{-50, 10}, {0, 10}}, color = {0, 127, 255}));
  annotation(Icon(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2})), Diagram(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2})));
end WaterTanks2;