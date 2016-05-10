within Tanks.Examples;

model WaterTanks1
  Components.Tank tank1 annotation(Placement(visible = true, transformation(origin = {-60, 20}, extent = {{-20, -20}, {20, 20}}, rotation = 0)));
  Components.Pipe pipe annotation(Placement(visible = true, transformation(origin = {-2, 0}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  Components.Tank tank2 annotation(Placement(visible = true, transformation(origin = {60, -32}, extent = {{-20, -20}, {20, 20}}, rotation = 0)));
  Interfaces.Fluid2Real fluid2Real1 annotation(Placement(visible = true, transformation(origin = {84, -66}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  Modelica.Blocks.Sources.Pulse pulse1(width = 30, period = 0.2) annotation(Placement(visible = true, transformation(origin = {-88, 90}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  Interfaces.Real2Fluid real2Fluid1 annotation(Placement(visible = true, transformation(origin = {-50, 66}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  Modelica.Blocks.Interfaces.RealOutput Tank1InFlow annotation(Placement(visible = true, transformation(origin = {110, 90}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  Modelica.Blocks.Interfaces.RealOutput Tank2WaterLevel annotation(Placement(visible = true, transformation(origin = {110, -18}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  Modelica.Blocks.Interfaces.RealOutput Tank2OutFlow annotation(Placement(visible = true, transformation(origin = {110, -54}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  Modelica.Blocks.Interfaces.RealOutput Tank1WaterLevel annotation(Placement(visible = true, transformation(origin = {110, 60}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
equation
  connect(tank1.level, Tank1WaterLevel) annotation(Line(points = {{-38, 20}, {110, 20}, {110, 60}}, color = {0, 0, 127}));
  connect(fluid2Real1.y, Tank2OutFlow) annotation(Line(points = {{94, -66}, {102, -66}, {102, -56}, {102, -56}}, color = {0, 0, 127}));
  connect(tank2.level, Tank2WaterLevel) annotation(Line(points = {{82, -32}, {102, -32}, {102, -18}, {102, -18}}, color = {0, 0, 127}));
  connect(pulse1.y, Tank1InFlow) annotation(Line(points = {{-77, 90}, {110, 90}}, color = {0, 0, 127}));
  connect(real2Fluid1.port_b, tank1.port_a) annotation(Line(points = {{-40, 66}, {-40, 51}, {-60, 51}, {-60, 40}}, color = {0, 127, 255}));
  connect(pulse1.y, real2Fluid1.u) annotation(Line(points = {{-77, 90}, {-66, 90}, {-66, 66}, {-59, 66}}, color = {0, 0, 127}));
  connect(fluid2Real1.y, Tank2OutFlow) annotation(Line(points = {{94, -66}, {110, -66}, {110, 0}}, color = {0, 0, 127}));
  connect(tank2.port_b, fluid2Real1.port_a) annotation(Line(points = {{60, -52}, {60, -66}, {74, -66}}, color = {0, 127, 255}));
  connect(pipe.port_b, tank2.port_a) annotation(Line(points = {{8, 0}, {60, 0}, {60, -12}}, color = {0, 127, 255}));
  connect(tank1.port_b, pipe.port_a) annotation(Line(points = {{-60, 0}, {-12, 0}}, color = {0, 127, 255}));
  annotation(Icon(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2})), Diagram(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2})));
end WaterTanks1;