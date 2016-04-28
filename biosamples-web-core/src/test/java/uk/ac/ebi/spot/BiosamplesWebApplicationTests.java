package uk.ac.ebi.spot;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import uk.ac.ebi.spot.biosamples.BiosamplesWebApplication;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = BiosamplesWebApplication.class)
@WebAppConfiguration
public class BiosamplesWebApplicationTests {

	@Test
	public void contextLoads() {
	}

}
