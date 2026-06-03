DROP TRIGGER IF EXISTS trigger_award_order_points ON public.orders;

CREATE TRIGGER trigger_award_order_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.award_order_points();